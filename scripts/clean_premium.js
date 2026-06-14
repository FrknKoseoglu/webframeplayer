const fs = require('fs');

function replaceFile(file, replacer) {
    let content = fs.readFileSync(file, 'utf8');
    let newContent = replacer(content);
    if (content !== newContent) {
        fs.writeFileSync(file, newContent, 'utf8');
        console.log('Updated', file);
    }
}

// 1. MagicLinkGenerator.tsx
replaceFile('src/components/magic-link/MagicLinkGenerator.tsx', c => {
    c = c.replace(/ \(Premium\)/g, '');
    c = c.replace(/disabled=\{!isPremium\}/g, '');
    c = c.replace(/!isPremium && "opacity-60 pointer-events-none select-none"/g, '""');
    c = c.replace(/!isPremium && "border border-amber-500\/30 p-4 rounded-2xl"/g, '""');
    c = c.replace(/\{!isPremium && <span.*?<\/span>\}/g, '');
    return c;
});

// 2. magic-code/page.tsx
replaceFile('src/app/magic-code/page.tsx', c => {
    // Remove disabled and premium placeholders
    c = c.replace(/disabled placeholder="Premium..."/g, 'placeholder="Özel Mesaj (Opsiyonel)"');
    c = c.replace(/disabled placeholder=\{language === 'tr' \? 'Sadece Premium üyelere özeldir' : 'Premium users only'\}/g, '');
    c = c.replace(/\{language === 'tr' \? 'Premium Özellikler' : 'Premium Features'\}/g, "{language === 'tr' ? 'Ek Özellikler' : 'Extra Features'}");
    c = c.replace(/\{language === 'tr' \? 'Premium özellikler için ' : 'For premium features contact: '\}/g, "''");
    c = c.replace(/\{language === 'tr' \? 'Linki Þifrele \(Premium\)' : 'Encrypt Link \(Premium\)'\}/g, "{language === 'tr' ? 'Linki Þifrele' : 'Encrypt Link'}");
    return c;
});

// 3. magic-code-faq/page.tsx
replaceFile('src/app/magic-code-faq/page.tsx', c => {
    c = c.replace(/Premium Özellikler/g, 'Ekstra Özellikler');
    c = c.replace(/Premium ayrýcalýklarýna/g, 'Bu özelliklere');
    return c;
});

// 4. Any other Premium text in design
replaceFile('design/main.html', c => c.replace(/Premium/g, ''));
replaceFile('design/settins.html', c => c.replace(/Premium Hesap/g, 'Pro Hesap'));

console.log('Premium cleanup done.');
