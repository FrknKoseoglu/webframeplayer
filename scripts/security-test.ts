
import { loadEnvConfig } from '@next/env';
loadEnvConfig(process.cwd());
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const BASE_URL = 'http://localhost:3000';

// Global state for headers/cookies
let attackerDetails = {
    username: 'attacker_prov',
    password: 'password123',
    id: '',
    cookie: ''
};

let victimDetails = {
    username: 'victim_prov',
    password: 'password123',
    id: '',
    cookie: ''
};

async function setupUsers() {
    console.log('🔧 Setting up test users...');
    
    // Cleanup first
    await prisma.creditLog.deleteMany({ where: { provider: { username: { in: ['attacker_prov', 'victim_prov'] } } } });
    await prisma.customer.deleteMany({ where: { provider: { username: { in: ['attacker_prov', 'victim_prov'] } } } });
    await prisma.serviceProvider.deleteMany({ where: { username: { in: ['attacker_prov', 'victim_prov'] } } });

    // Create Attacker
    const attacker = await prisma.serviceProvider.create({
        data: {
            username: 'attacker_prov',
            // Hash for 'password123' (simplified)
            password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4hXw.vE/a6', 
            email: 'attacker@test.com',
            credits: 10,
            userLimit: 100
        }
    });

    attackerDetails.id = attacker.id;

    console.log('✅ Users setup complete.');
}

async function getAuthCookie(username, password) {
    // 1. Get CSRF Token
    const csrfRes = await fetch(`${BASE_URL}/api/auth/csrf`);
    const csrfData = await csrfRes.json();
    const csrfToken = csrfData.csrfToken;
    const cookies = csrfRes.headers.get('set-cookie');

    // 2. Login
    const formData = new URLSearchParams();
    formData.append('username', username);
    formData.append('password', password);
    formData.append('redirect', 'false');
    formData.append('csrfToken', csrfToken);
    formData.append('callbackUrl', '/');
    formData.append('json', 'true');

    const loginRes = await fetch(`${BASE_URL}/api/auth/callback/credentials`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Cookie': cookies || ''
        },
        body: formData
    });

    // Check if login success (302 or 200)
    // NextAuth often returns 200 with url in json if redirect=false
    // The important thing is the 'set-cookie' header containing 'authjs.session-token'
    const newCookies = loginRes.headers.get('set-cookie');
    
    // Combine cookies
    const allCookies = [cookies, newCookies].filter(Boolean).join('; ');
    return allCookies;
}

async function attack1_15MinLock() {
    console.log('\n⚔️ ATTACK 1: Bypassing 15-Minute Lock');
    
    // 1. Create a customer 20 mins ago (manual DB)
    const oldDate = new Date();
    oldDate.setMinutes(oldDate.getMinutes() - 25);
    
    const customer = await prisma.customer.create({
        data: {
            name: 'Old User',
            type: 'XTREAM',
            xtreamUsername: 'old_user',
            xtreamPassword: 'password',
            xtreamHost: 'http://old.com',
            providerId: attackerDetails.id,
            createdAt: oldDate
        }
    });

    // 2. Try to PATCH critical fields
    const res = await fetch(`${BASE_URL}/api/provider/customers`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            'Cookie': attackerDetails.cookie
        },
        body: JSON.stringify({
            id: customer.id,
            name: 'New Name', // Allowed
            xtreamHost: 'http://hacked.com' // Blocked
        })
    });

    if (res.status === 403) {
        console.log('✅ Attack BLOCKED (403 Forbidden). System Secure.');
    } else {
        console.error(`❌ Attack SUCCEEDED (Status ${res.status}). VULNERABILITY FOUND!`);
    }
}

async function attack2_DoubleSpend() {
    console.log('\n⚔️ ATTACK 2: Double Spend (Race Condition)');
    
    // 1. Set credits to 1
    await prisma.serviceProvider.update({
        where: { id: attackerDetails.id },
        data: { credits: 1 }
    });

    // 2. Fire 5 requests simultaneously
    const payload = {
        name: 'Race User',
        type: 'M3U',
        m3uUrl: 'http://test.com',
        createMagicLink: false
    };

    const requests = Array(5).fill(0).map((_, i) => 
        fetch(`${BASE_URL}/api/provider/customers`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Cookie': attackerDetails.cookie
            },
            body: JSON.stringify({ ...payload, name: `Race User ${i}` })
        })
    );

    const responses = await Promise.all(requests);
    const successCount = responses.filter(r => r.status === 200).length;
    
    // Check final credits
    const finalProvider = await prisma.serviceProvider.findUnique({ where: { id: attackerDetails.id } });
    
    console.log(`Results: ${successCount} successes out of 5 requests.`);
    console.log(`Final Credits: ${finalProvider?.credits}`);

    if (successCount > 1 || (finalProvider?.credits ?? 0) < 0) {
        console.error('❌ Attack SUCCEEDED. Double Spend Vulnerability Confirmed!');
    } else {
        console.log('✅ Attack BLOCKED. System Secure.');
    }
}

async function attack3_CreditBypass() {
    console.log('\n⚔️ ATTACK 3: Credit Check Bypass (0 Credits)');
    
    // 1. Set credits to 0
    await prisma.serviceProvider.update({
        where: { id: attackerDetails.id },
        data: { credits: 0 }
    });

    // 2. Try to create
    const res = await fetch(`${BASE_URL}/api/provider/customers`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Cookie': attackerDetails.cookie
        },
        body: JSON.stringify({
            name: 'Zero User',
            type: 'M3U',
            m3uUrl: 'http://test.com'
        })
    });

    if (res.status === 403) {
        console.log('✅ Attack BLOCKED (403 Forbidden). System Secure.');
    } else {
        console.error(`❌ Attack SUCCEEDED (Status ${res.status}). VULNERABILITY FOUND!`);
    }
}

async function attack4_PrivilegeEscalation() {
    console.log('\n⚔️ ATTACK 4: Privilege Escalation (Admin Endpoint)');
    
    const res = await fetch(`${BASE_URL}/api/admin/credits`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Cookie': attackerDetails.cookie // Normal provider cookie
        },
        body: JSON.stringify({
            providerId: attackerDetails.id,
            amount: 100
        })
    });

    if (res.status === 401 || res.status === 403) {
        console.log('✅ Attack BLOCKED (401/403). System Secure.');
    } else {
        console.error(`❌ Attack SUCCEEDED (Status ${res.status}). VULNERABILITY FOUND!`);
    }
}

async function attack5_IDOR() {
    console.log('\n⚔️ ATTACK 5: IDOR (Accessing other provider data)');
    
    // 1. Create a victim provider and customer
    const victim = await prisma.serviceProvider.create({
        data: {
            username: 'victim_prov',
            password: 'hash',
            email: 'victim@test.com',
            credits: 10
        }
    });

    const victimCustomer = await prisma.customer.create({
        data: {
            name: 'Victim User',
            type: 'M3U',
            m3uUrl: 'http://victim.com',
            providerId: victim.id
        }
    });

    // 2. Attacker tries to patch victim customer
    const res = await fetch(`${BASE_URL}/api/provider/customers`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            'Cookie': attackerDetails.cookie
        },
        body: JSON.stringify({
            id: victimCustomer.id,
            name: 'Hacked Name'
        })
    });

    if (res.status === 404 || res.status === 403) {
        console.log('✅ Attack BLOCKED (404/403). System Secure.');
    } else {
        console.error(`❌ Attack SUCCEEDED (Status ${res.status}). VULNERABILITY FOUND!`);
    }
    
    // Cleanup victim
    await prisma.customer.delete({ where: { id: victimCustomer.id } });
    await prisma.serviceProvider.delete({ where: { id: victim.id } });
}

async function main() {
    try {
        await setupUsers();
        
        console.log('🔑 Authenticating attacker...');
        attackerDetails.cookie = await getAuthCookie(attackerDetails.username, 'password123');
        
        if (!attackerDetails.cookie.includes('authjs.session-token') && !attackerDetails.cookie.includes('next-auth.session-token')) {
            console.warn('⚠️  Warning: Login might have failed. Cookie not found in response.');
            // Proceed anyway to see what happens
        }

        await attack1_15MinLock();
        await attack2_DoubleSpend();
        await attack3_CreditBypass();
        await attack4_PrivilegeEscalation();
        await attack5_IDOR();

    } catch (error) {
        console.error('Test Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
