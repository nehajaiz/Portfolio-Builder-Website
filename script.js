document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('portfolio-form');
    const preview = document.getElementById('portfolio-preview');
    const themeToggle = document.getElementById('theme-toggle');
    const downloadHtmlBtn = document.getElementById('download-html');
    const downloadPdfBtn = document.getElementById('download-pdf');
    const sectionsList = document.getElementById('sections-list');
    const addSectionBtn = document.getElementById('add-section');

    let sections = ['about', 'skills', 'education', 'projects', 'contact'];
    let customizations = { primaryColor: '#007bff', fontFamily: 'Arial' };

    // Load from LocalStorage
    loadData();

    // Event listeners
    form.addEventListener('input', updatePreview);
    document.getElementById('template').addEventListener('change', updatePreview);
    document.getElementById('primary-color').addEventListener('input', (e) => {
        customizations.primaryColor = e.target.value;
        updatePreview();
    });
    document.getElementById('font-family').addEventListener('change', (e) => {
        customizations.fontFamily = e.target.value;
        updatePreview();
    });
    themeToggle.addEventListener('click', toggleTheme);
    downloadHtmlBtn.addEventListener('click', downloadHtml);
    downloadPdfBtn.addEventListener('click', downloadPdf);
    addSectionBtn.addEventListener('click', addSection);

    // Section management
    sectionsList.addEventListener('click', (e) => {
        const item = e.target.closest('.section-item');
        if (e.target.classList.contains('move-up')) {
            moveSection(item, -1);
        } else if (e.target.classList.contains('move-down')) {
            moveSection(item, 1);
        } else if (e.target.classList.contains('remove')) {
            removeSection(item);
        }
    });

    function updatePreview() {
        const data = getFormData();
        preview.className = `portfolio ${data.template}`;
        preview.style.fontFamily = customizations.fontFamily;
        preview.style.setProperty('--primary-color', customizations.primaryColor);

        let html = '';
        sections.forEach(section => {
            if (section === 'about') {
                html += `<div class="section about">
                    <img src="${data.profileImage || ''}" alt="Profile">
                    <h1>${data.name}</h1>
                    <p>${data.bio}</p>
                </div>`;
            } else if (section === 'skills') {
                html += `<div class="section skills">
                    <h2>Skills</h2>
                    <ul>${data.skills.split(',').map(s => `<li>${s.trim()}</li>`).join('')}</ul>
                </div>`;
            } else if (section === 'education') {
                html += `<div class="section education">
                    <h2>Education</h2>
                    <p>${data.education.replace(/\n/g, '<br>')}</p>
                </div>`;
            } else if (section === 'projects') {
                html += `<div class="section projects">
                    <h2>Projects</h2>
                    <p>${data.projects.replace(/\n/g, '<br>')}</p>
                </div>`;
            } else if (section === 'contact') {
                html += `<div class="section contact">
                    <h2>Contact</h2>
                    <p>${data.socialLinks.replace(/\n/g, '<br>')}</p>
                </div>`;
            }
        });
        preview.innerHTML = html;
        saveData();
    }

    function getFormData() {
        return {
            name: document.getElementById('name').value,
            bio: document.getElementById('bio').value,
            profileImage: document.getElementById('profile-image').value,
            skills: document.getElementById('skills').value,
            education: document.getElementById('education').value,
            projects: document.getElementById('projects').value,
            socialLinks: document.getElementById('social-links').value,
            template: document.getElementById('template').value
        };
    }

    function toggleTheme() {
        document.body.classList.toggle('dark');
        localStorage.setItem('theme', document.body.classList.contains('dark') ? 'dark' : 'light');
    }

    function moveSection(item, direction) {
        const index = Array.from(sectionsList.children).indexOf(item);
        const newIndex = index + direction;
        if (newIndex >= 0 && newIndex < sectionsList.children.length) {
            sectionsList.insertBefore(item, sectionsList.children[newIndex + (direction > 0 ? 1 : 0)]);
            sections.splice(newIndex, 0, sections.splice(index, 1)[0]);
            updatePreview();
        }
    }

    function removeSection(item) {
        const section = item.dataset.section;
        sections = sections.filter(s => s !== section);
        item.remove();
        updatePreview();
    }

    function addSection() {
        const sectionName = prompt('Enter section name (e.g., experience):');
        if (sectionName) {
            sections.push(sectionName);
            const item = document.createElement('div');
            item.className = 'section-item';
            item.dataset.section = sectionName;
            item.innerHTML = `${sectionName} <button class="move-up">↑</button><button class="move-down">↓</button><button class="remove">Remove</button>`;
            sectionsList.appendChild(item);
            updatePreview();
        }
    }

    function downloadHtml() {
        const html = `<!DOCTYPE html>
<html>
<head>
    <title>${getFormData().name}'s Portfolio</title>
    <style>
        body { font-family: ${customizations.fontFamily}; background: #f4f4f4; color: #333; padding: 20px; }
        .portfolio { max-width: 800px; margin: 0 auto; background: #fff; padding: 20px; border-radius: 8px; }
        img { max-width: 150px; border-radius: 50%; }
        h1, h2 { color: ${customizations.primaryColor}; }
    </style>
</head>
<body>
    <div class="portfolio">${preview.innerHTML}</div>
</body>
</html>`;
        const blob = new Blob([html], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'portfolio.html';
        a.click();
    }

    function downloadPdf() {
        const element = preview;
        html2pdf().from(element).save('portfolio.pdf');
    }

    function saveData() {
        const data = getFormData();
        data.sections = sections;
        data.customizations = customizations;
        localStorage.setItem('portfolioData', JSON.stringify(data));
    }

    function loadData() {
        const data = JSON.parse(localStorage.getItem('portfolioData'));
        if (data) {
            document.getElementById('name').value = data.name || '';
            document.getElementById('bio').value = data.bio || '';
            document.getElementById('profile-image').value = data.profileImage || '';
            document.getElementById('skills').value = data.skills || '';
            document.getElementById('education').value = data.education || '';
            document.getElementById('projects').value = data.projects || '';
            document.getElementById('social-links').value = data.socialLinks || '';
            document.getElementById('template').value = data.template || 'minimal';
            customizations = data.customizations || customizations;
            document.getElementById('primary-color').value = customizations.primaryColor;
            document.getElementById('font-family').value = customizations.fontFamily;
            sections = data.sections || sections;
            // Rebuild sections list
            sectionsList.innerHTML = '';
            sections.forEach(section => {
                const item = document.createElement('div');
                item.className = 'section-item';
                item.dataset.section = section;
                item.innerHTML = `${section} <button class="move-up">↑</button><button class="move-down">↓</button><button class="remove">Remove</button>`;
                sectionsList.appendChild(item);
            });
        }
        const theme = localStorage.getItem('theme');
        if (theme === 'dark') document.body.classList.add('dark');
        updatePreview();
    }
});