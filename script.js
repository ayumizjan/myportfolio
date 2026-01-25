// JavaScript Document

// (1) all set
window.addEventListener('load', () => {
    console.log("Web Loaded! Starting Step 1...");
    const loader = document.getElementById('step0');
    
    // open desktop
    if (loader) loader.classList.add('loading-hidden');
    
    // start Step 1
    updateLayer(1);
    currentStep = 1;
});

// (2) Hamburger Menu
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('nav-links');

if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        hamburger.classList.toggle('active');
    });
}
function goToPage(stepNum) {
    updateLayer(stepNum); // change page
    currentStep = stepNum; // update now
    
    // close menu on click (content active)
    navLinks.classList.remove('active');
    hamburger.classList.remove('active');
}

// (3) Scroll & Layer
let currentStep = 0; 

function updateLayer(stepNum) {
    console.log("--- สั่งงาน Step: " + stepNum + " ---");
    
    // 1. จัดการหน้า Page (Text Content)
    const allPages = document.querySelectorAll('.page');
    allPages.forEach(page => page.classList.remove('active'));
    
    const activePage = document.getElementById(`p${stepNum}`); 
    if (activePage) { 
        activePage.classList.add('active');
        activePage.scrollTop = 0; 
    }

    // 2. จัดการวิดีโอ (Seamless Transition)
    const allVids = document.querySelectorAll('.video-step');
    allVids.forEach(vid => {
        vid.classList.remove('active');
        const v = vid.querySelector('video');
        if(v) v.pause(); 
    });

    const activeVid = document.getElementById(`a${stepNum}`); 
    if (activeVid) {
        activeVid.classList.add('active');
        const videoTag = activeVid.querySelector('video');
        if (videoTag) {
            videoTag.currentTime = 0;
            videoTag.play().catch(e => console.log("Video play error:", e));

            // ตรวจสอบว่าเป็นวิดีโอทางผ่าน (Bridge) หรือไม่
            if (stepNum === 2 || stepNum === 4) {
                videoTag.loop = false; // เล่นรอบเดียว
                videoTag.onended = () => {
                    // เมื่อจบวิดีโอ Bridge ให้ขยับไปหน้าเนื้อหาถัดไปทันที
                    const nextStep = stepNum + 1;
                    updateLayer(nextStep);
                    currentStep = nextStep;
                };
            } else if (stepNum === 5) {
                // 🌟 หน้าสุดท้าย: เล่นรอบเดียวแล้ว "หยุด"
                videoTag.loop = false; 
                videoTag.onended = null; // ไม่ต้องไปไหนต่อ
            } else {
                // หน้าหลัก 1, 3, 5 ให้เล่นวนลูปไปเรื่อยๆ
                videoTag.loop = true;
                videoTag.onended = null; // ล้างคำสั่ง onended เดิมออก
            }
        }
    }

    // 3. จัดการ Footer (แสดงเฉพาะหน้าสุดท้าย p5)
    const fixedFooter = document.getElementById('fixed-footer');
    if (fixedFooter) {
        if (stepNum === 5) {
            fixedFooter.classList.add('show');
        } else {
            fixedFooter.classList.remove('show');
        }
    }
}

window.addEventListener('scroll', () => {
    const scrollTop = window.scrollY;
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;

    //scroll down hint
    const scrollHint = document.getElementById('scroll-hint');
    if (window.scrollY > 50) {
        scrollHint.classList.add('fade-out');
    } else {
    scrollHint.classList.remove('fade-out');
    }
    
    if (maxScroll <= 0) return;

    // announce scroll one time
    const scrollPercent = (scrollTop / maxScroll) * 100;
    console.log("Percent:", Math.round(scrollPercent) + "%");

    let targetStep = 1;
    let subPercent = 0; 

    if (scrollPercent <= 35) {
        targetStep = 1;
        subPercent = (scrollPercent / 35) * 100;
    }
    else if (scrollPercent <= 40) {
        // Step 2 กลายเป็นสะพานเชื่อม (เลื่อนนิดเดียวข้ามไป 3 เลย)
        targetStep = 2;
        subPercent = 0;
    }
    else if (scrollPercent <= 75) {
        targetStep = 3;
        subPercent = ((scrollPercent - 40) / 35) * 100;
    }
    else if (scrollPercent <= 80) {
        // Step 4 กลายเป็นสะพานเชื่อม (เลื่อนนิดเดียวข้ามไป 5 เลย)
        targetStep = 4;
        subPercent = 0;
    }
    else {
        targetStep = 5;
        subPercent = ((scrollPercent - 80) / 20) * 100;
    }

    if (targetStep !== currentStep) {
        updateLayer(targetStep);
        currentStep = targetStep;
    }

    scrollContentInside(targetStep, subPercent);
});

function scrollContentInside(stepNum, percent) {
    const page = document.getElementById(`p${stepNum}`);
    if (page) {
        const scrollAmount = (page.scrollHeight - page.clientHeight) * (percent / 100);
        page.scrollTop = scrollAmount;
    }
}

// (4) Form Handling
const form = document.getElementById('my-form');
const scriptURL = 'https://script.google.com/macros/s/AKfycbzUWLrpwSf-0FDXPEKfpPwumDuATISK55lIEzf1FZWBSTKmkXt9oWidZnF78J6XEA-b/exec';

if (form) {
    form.addEventListener('submit', e => {
        e.preventDefault(); 

        // checking spam
        const honeypot = form.elements['honeypot'].value;
        if (honeypot) {
            console.log("Bot detected!");
            return; // stop sending Google Sheet
        }

        // checking double sending (disturb)
        const lastSubmit = localStorage.getItem('lastSubmitTime');
        const now = Date.now();
    
        if (lastSubmit && (now - lastSubmit < 60000)) { // 60000 ms = 1 min
            alert("One story at a time, please! The ink is still drying on your last one.");
            return;
        }

        const submitBtn = document.getElementById('submit-btn');
        if (submitBtn) {
            submitBtn.disabled = true; 
            submitBtn.innerText = "sending...";
        }

        fetch(scriptURL, { method: 'POST', body: new FormData(form)})
        .then(response => {
            const status = document.getElementById('form-status');
            if (status) status.innerText = "Sparkle done! Thanks for spending your lovely time with me.";
            form.reset(); 
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.innerText = "Sent";
            }
        })
        .catch(error => {
            console.error('Error!', error.message);
            alert("Give it another magical touch!");
        });
    });
}

// (5) Security & Popups
const errorPopup = document.getElementById('error-popup');

window.addEventListener('contextmenu', (event) => {
    event.preventDefault(); 
    if (errorPopup) errorPopup.classList.add('show');
});

window.addEventListener('keydown', (event) => {
    if (event.keyCode === 123 || 
        (event.ctrlKey && event.shiftKey && event.keyCode === 73) || 
        (event.ctrlKey && event.keyCode === 85)) {
        event.preventDefault();
        alert("ฟังก์ชันนี้ถูกปิดใช้งานเพื่อความปลอดภัย ;)");
    }
    if (event.key === "Escape" && errorPopup) {
        errorPopup.classList.remove('show');
    }
});

function closeError() {
    if (errorPopup) errorPopup.classList.remove('show');
}