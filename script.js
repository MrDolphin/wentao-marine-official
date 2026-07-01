document.addEventListener('DOMContentLoaded', () => {
    // 汉堡菜单切换
    const hamburger = document.getElementById('hamburger');
    const navLinks = document.querySelector('.nav-links');

    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navLinks.classList.toggle('active');
    });

    // 导航栏平滑滚动
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            
            // 关闭移动端菜单
            hamburger.classList.remove('active');
            navLinks.classList.remove('active');

            const targetId = link.getAttribute('href');
            if(targetId && targetId !== '#') {
                const targetSection = document.querySelector(targetId);
                if(targetSection) {
                    const headerHeight = document.querySelector('.header').offsetHeight;
                    window.scrollTo({
                        top: targetSection.offsetTop - headerHeight,
                        behavior: 'smooth'
                    });
                }
            }
        });
    });

    // 滚动时改变导航栏高亮状态
    window.addEventListener('scroll', () => {
        const sections = document.querySelectorAll('section');
        const navItems = document.querySelectorAll('.nav-links a');
        
        let current = '';
        const headerHeight = document.querySelector('.header').offsetHeight;
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            if (pageYOffset >= sectionTop - headerHeight - 100) {
                current = '#' + section.getAttribute('id');
            }
        });

        navItems.forEach(item => {
            item.classList.remove('active');
            if (item.getAttribute('href') === current) {
                item.classList.add('active');
            }
        });
    });

    // 交叉观察器 (Intersection Observer) 实现滚动淡入动画
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.15
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                // 可选：动画触发后取消观察，使动画仅执行一次
                // observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // 观察所有带有 fade-in-up, fade-in-left, fade-in-right 的元素
    const animatedElements = document.querySelectorAll('.fade-in-up, .fade-in-left, .fade-in-right');
    animatedElements.forEach(el => observer.observe(el));

    // 语言切换逻辑
    const langToggles = document.querySelectorAll('.lang-toggle');
    const zhElements = document.querySelectorAll('.lang-zh');
    const enElements = document.querySelectorAll('.lang-en');

    langToggles.forEach(toggle => {
        toggle.addEventListener('click', (e) => {
            e.preventDefault();
            langToggles.forEach(t => t.classList.remove('active'));
            toggle.classList.add('active');
            
            const selectedLang = toggle.getAttribute('data-lang');
            
            if (selectedLang === 'en') {
                zhElements.forEach(el => el.style.display = 'none');
                enElements.forEach(el => el.style.display = ''); // 恢复内联或默认
            } else {
                zhElements.forEach(el => el.style.display = '');
                enElements.forEach(el => el.style.display = 'none');
            }
        });
    });

    // 初始化关于我们页面的可拖拽地图 (Leaflet + OpenStreetMap)
    const mapElement = document.getElementById('company-map');
    if (mapElement) {
        // 坐标：浙江省舟山市岱山县秀山乡 (约 30.25, 122.20)
        const lat = 30.25;
        const lng = 122.20;
        
        const map = L.map('company-map').setView([lat, lng], 13);
        
        L.tileLayer('https://webrd0{s}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}', {
            subdomains: ["1", "2", "3", "4"],
            attribution: '&copy; <a href="https://ditu.amap.com/">高德地图 (Amap)</a>'
        }).addTo(map);

        // 添加公司位置标记
        const marker = L.marker([lat, lng]).addTo(map);
        
        // 绑定弹出信息
        marker.bindPopup(`
            <div style="text-align: center;">
                <strong class="lang-zh">岱山文涛船舶工程有限公司</strong>
                <strong class="lang-en" style="display:none;">Wentao Marine Engineering</strong>
                <br>
                <span class="lang-zh" style="font-size: 12px; color: #666;">浙江省舟山市岱山县秀山乡兰山35号</span>
                <span class="lang-en" style="display:none; font-size: 12px; color: #666;">No. 35 Lanshan, Xiushan Township</span>
            </div>
        `).openPopup();
        
        // 监听语言切换以更新地图弹出框文本
        langToggles.forEach(toggle => {
            toggle.addEventListener('click', () => {
                const currentLang = toggle.getAttribute('data-lang');
                const popupElement = marker.getPopup().getElement();
                if (popupElement) {
                    const zhEls = popupElement.querySelectorAll('.lang-zh');
                    const enEls = popupElement.querySelectorAll('.lang-en');
                    if (currentLang === 'en') {
                        zhEls.forEach(el => el.style.display = 'none');
                        enEls.forEach(el => el.style.display = '');
                    } else {
                        zhEls.forEach(el => el.style.display = '');
                        enEls.forEach(el => el.style.display = 'none');
                    }
                }
            });
        });
    }

    // 表单提交与数据保留逻辑
    const contactForm = document.getElementById('contactForm');
    const formSuccess = document.getElementById('formSuccess');
    
    // 监听语言切换，更新表单的 placeholder
    langToggles.forEach(toggle => {
        toggle.addEventListener('click', () => {
            const currentLang = toggle.getAttribute('data-lang');
            const inputs = document.querySelectorAll('#contactForm input');
            inputs.forEach(input => {
                if(currentLang === 'en') {
                    input.placeholder = input.getAttribute('data-en-placeholder');
                } else {
                    input.placeholder = input.getAttribute('data-zh-placeholder');
                }
            });
        });
    });

    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const submitBtn = contactForm.querySelector('.submit-btn');
            const originalBtnHtml = submitBtn.innerHTML;
            
            // 显示加载状态
            submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>';
            submitBtn.disabled = true;

            const formData = new FormData(contactForm);

            try {
                const response = await fetch('https://api.web3forms.com/submit', {
                    method: 'POST',
                    body: formData
                });
                
                if (response.ok) {
                    // 显示成功提示，隐藏表单
                    contactForm.style.display = 'none';
                    formSuccess.style.display = 'flex';
                } else {
                    alert('提交失败，请稍后再试。');
                    submitBtn.innerHTML = originalBtnHtml;
                    submitBtn.disabled = false;
                }
            } catch (error) {
                console.error('Form submission error:', error);
                alert('网络错误，请检查网络后重试。');
                submitBtn.innerHTML = originalBtnHtml;
                submitBtn.disabled = false;
            }
        });
    }
});
