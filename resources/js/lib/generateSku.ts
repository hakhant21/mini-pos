const burmeseTransliteration: Record<string, string> = {
    'က': 'K', 'ခ': 'KH', 'ဂ': 'G', 'ဃ': 'G', 'င': 'NG',
    'စ': 'S', 'ဆ': 'HS', 'ဇ': 'Z', 'ဈ': 'Z', 'ဉ': 'NY', 'ည': 'NY',
    'ဋ': 'T', 'ဌ': 'T', 'ဍ': 'D', 'ဎ': 'D', 'ဏ': 'N',
    'တ': 'T', 'ထ': 'HT', 'ဒ': 'D', 'ဓ': 'D', 'န': 'N',
    'ပ': 'P', 'ဖ': 'PH', 'ဗ': 'B', 'ဘ': 'B', 'မ': 'M',
    'ယ': 'Y', 'ရ': 'Y', 'လ': 'L', 'ဝ': 'W', 'သ': 'TH', 'ဟ': 'H',
    'ဠ': 'L', 'အ': 'A', 'ဣ': 'I', 'ဤ': 'I', 'ဥ': 'U', 'ဦ': 'U',
    'ဧ': 'E', 'ဩ': 'O', 'ဪ': 'O',
    'ါ': 'A', 'ာ': 'A', 'ိ': 'I', 'ီ': 'I', 'ု': 'U', 'ူ': 'U',
    'ေ': 'E', 'ဲ': 'AI', 'ံ': 'N', '့': '', 'း': '', '္': '', '်': '',
};

export function generateSku(name: string): string {
    if (!/[\u1000-\u109f]/u.test(name)) {
        return '';
    }

    const myanmarEnglishName = name.replaceAll('အစိမ်း', 'ASEIN');
    const tokens = Array.from(myanmarEnglishName.normalize('NFKD')).reduce<string[]>((result, character) => {
        if (/^[a-zA-Z0-9]$/.test(character)) {
            const token = result.at(-1) ?? '';

            result[result.length - 1] = `${token}${character.toUpperCase()}`;
        } else if (burmeseTransliteration[character] !== undefined) {
            const token = result.at(-1) ?? '';

            result[result.length - 1] = `${token}${burmeseTransliteration[character]}`;
        } else if (character.codePointAt(0)! < 128 || /[\u0300-\u036f]/.test(character)) {
            if (result.at(-1) !== '') {
                result.push('');
            }
        }

        return result;
    }, ['']);

    const slug = tokens.filter(Boolean).join('-').slice(0, 96);

    if (!slug) {
        return '';
    }

    const randomNumber = Math.floor(Math.random() * 900) + 100;

    return `${slug}-${randomNumber}`;
}
