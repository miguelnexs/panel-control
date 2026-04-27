
const fs = require('fs');
const content = fs.readFileSync('frontend/src/renderer/src/components/ConfigPage.tsx', 'utf8');

function countTags(str) {
    const openDiv = (str.match(/<div/g) || []).length;
    const closeDiv = (str.match(/<\/div>/g) || []).length;
    const openForm = (str.match(/<form/g) || []).length;
    const closeForm = (str.match(/<\/form>/g) || []).length;
    return { openDiv, closeDiv, openForm, closeForm };
}

console.log(countTags(content));
