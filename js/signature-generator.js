// SIGNATURE GENERATOR PRO - World's Best Digital Signature Tool

class SignatureGeneratorPro {
    constructor() {
        this.currentStyle = 'dancing';
        this.currentColor = '#000000';
        this.currentSize = 'medium';
        this.userName = '';
        this.shareCount = 0;
        
        this.signatureStyles = {
            dancing: {
                name: 'Elegant Script',
                font: 'Dancing Script',
                weight: '600',
                class: 'font-dancing',
                description: 'Classic handwritten elegance',
                personality: 'You have refined taste and appreciate traditional beauty. Your elegant signature suggests confidence and sophistication.',
                complexity: 'Professional'
            },
            great_vibes: {
                name: 'Luxury Calligraphy',
                font: 'Great Vibes',
                weight: '400',
                class: 'font-great-vibes',
                description: 'Luxurious flowing strokes',
                personality: 'You are creative and expressive. Your artistic signature reflects a free spirit and unique personality.',
                complexity: 'Artistic'
            },
            alex_brush: {
                name: 'Casual Brush',
                font: 'Alex Brush',
                weight: '400',
                class: 'font-alex-brush',
                description: 'Relaxed brush lettering style',
                personality: 'You are approachable and friendly. Your casual signature shows authenticity and down-to-earth nature.',
                complexity: 'Friendly'
            },
            allura: {
                name: 'Romantic Script',
                font: 'Allura',
                weight: '400',
                class: 'font-allura',
                description: 'Romantic and flowing',
                personality: 'You are passionate and emotional. Your romantic signature reveals a warm heart and strong relationships.',
                complexity: 'Expressive'
            },
            pacifico: {
                name: 'Modern Casual',
                font: 'Pacifico',
                weight: '400',
                class: 'font-pacifico',
                description: 'Contemporary and approachable',
                personality: 'You are modern and innovative. Your contemporary signature suggests forward-thinking and adaptability.',
                complexity: 'Contemporary'
            },
            kaushan: {
                name: 'Artistic Flair',
                font: 'Kaushan Script',
                weight: '400',
                class: 'font-kaushan',
                description: 'Bold artistic expression',
                personality: 'You are bold and confident. Your artistic signature shows leadership qualities and creative vision.',
                complexity: 'Bold'
            },
            serif: {
                name: 'Classic Formal',
                font: 'Georgia',
                weight: 'italic',
                class: 'font-serif',
                description: 'Traditional and authoritative',
                personality: 'You are reliable and trustworthy. Your classic signature reflects stability and professional competence.',
                complexity: 'Authoritative'
            },
            script: {
                name: 'Vintage Style',
                font: 'Brush Script MT',
                weight: '400',
                class: 'font-script',
                description: 'Nostalgic brush script',
                personality: 'You appreciate history and tradition. Your vintage signature shows wisdom and timeless appeal.',
                complexity: 'Distinguished'
            },
            elegant: {
                name: 'Executive Bold',
                font: 'Times New Roman',
                weight: 'bold italic',
                class: 'font-elegant',
                description: 'Powerful and commanding',
                personality: 'You are a natural leader. Your executive signature demonstrates authority and decision-making confidence.',
                complexity: 'Executive'
            },
            modern: {
                name: 'Minimalist Chic',
                font: 'Helvetica Neue',
                weight: '300 italic',
                class: 'font-modern',
                description: 'Clean and sophisticated',
                personality: 'You value simplicity and efficiency. Your minimalist signature reflects modern thinking and clarity.',
                complexity: 'Sophisticated'
            },
            bold: {
                name: 'Power Statement',
                font: 'Arial Black',
                weight: '900',
                class: 'font-bold',
                description: 'Strong and impactful',
                personality: 'You are decisive and impactful. Your bold signature shows strength of character and determination.',
                complexity: 'Commanding'
            },
            minimal: {
                name: 'Refined Simple',
                font: 'Avenir',
                weight: '300',
                class: 'font-minimal',
                description: 'Understated elegance',
                personality: 'You prefer quality over quantity. Your refined signature suggests intelligence and thoughtful consideration.',
                complexity: 'Refined'
            }
        };

        this.sizeOptions = {
            small: { width: 300, height: 100, fontSize: 24 },
            medium: { width: 400, height: 150, fontSize: 32 },
            large: { width: 600, height: 200, fontSize: 48 },
            xlarge: { width: 800, height: 250, fontSize: 64 }
        };

        this.globalCities = [
            'New York', 'London', 'Tokyo', 'Paris', 'Mumbai', 'Sydney', 'Berlin', 'Toronto',
            'Singapore', 'Dubai', 'Los Angeles', 'Amsterdam', 'Seoul', 'Barcelona', 'Rome',
            'San Francisco', 'Hong Kong', 'Stockholm', 'Copenhagen', 'Zurich', 'Vienna',
            'Milan', 'Brussels', 'Helsinki', 'Oslo', 'Prague', 'Warsaw', 'Budapest'
        ];

        this.init();
    }

    init() {
        this.setupEventListeners();
        this.generateStyles();
        this.startViralNotifications();
        this.startCounterAnimation();
        this.loadShareCount();
    }

    setupEventListeners() {
        // Name input
        const nameInput = document.getElementById('nameInput');
        nameInput.addEventListener('input', (e) => {
            this.userName = e.target.value;
            this.updatePreview();
        });

        // Color selection
        document.querySelectorAll('.color-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.color-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.currentColor = e.target.dataset.color;
                this.updatePreview();
            });
        });

        // Size selection
        const sizeSelect = document.getElementById('sizeSelect');
        sizeSelect.addEventListener('change', (e) => {
            this.currentSize = e.target.value;
            this.updatePreview();
        });

        // Download buttons
        document.getElementById('downloadPNG').addEventListener('click', () => this.downloadSignature('png'));
        document.getElementById('downloadSVG').addEventListener('click', () => this.downloadSignature('svg'));
        document.getElementById('downloadJPG').addEventListener('click', () => this.downloadSignature('jpg'));
        document.getElementById('downloadAnimated').addEventListener('click', () => this.downloadAnimated());

        // Back button fallback
        document.querySelector('.back-btn').addEventListener('click', (e) => {
            e.preventDefault();
            if (window.history.length > 1) {
                window.history.back();
            } else {
                window.location.href = 'index.html';
            }
        });
    }

    generateStyles() {
        const stylesGrid = document.getElementById('stylesGrid');
        stylesGrid.innerHTML = '';

        Object.entries(this.signatureStyles).forEach(([key, style]) => {
            const styleCard = document.createElement('div');
            styleCard.className = 'style-card';
            styleCard.dataset.style = key;
            
            if (key === this.currentStyle) {
                styleCard.classList.add('active');
            }

            styleCard.innerHTML = `
                <div class="style-preview">
                    <svg width="220" height="60" viewBox="0 0 220 60">
                        <text x="110" y="40" text-anchor="middle" 
                              font-family="${style.font}" 
                              font-weight="${style.weight}" 
                              font-size="24" 
                              fill="#2563eb"
                              class="${style.class}">Sample Signature</text>
                    </svg>
                </div>
                <div class="style-name">${style.name}</div>
                <div class="style-desc">${style.description}</div>
                <div class="style-badge">Selected</div>
            `;

            styleCard.addEventListener('click', () => {
                document.querySelectorAll('.style-card').forEach(card => card.classList.remove('active'));
                styleCard.classList.add('active');
                this.currentStyle = key;
                this.updatePreview();
            });

            stylesGrid.appendChild(styleCard);
        });
    }

    updatePreview() {
        if (!this.userName.trim()) {
            document.getElementById('previewSection').style.display = 'none';
            document.getElementById('downloadSection').style.display = 'none';
            return;
        }

        document.getElementById('previewSection').style.display = 'block';
        document.getElementById('downloadSection').style.display = 'block';

        const style = this.signatureStyles[this.currentStyle];
        const size = this.sizeOptions[this.currentSize];
        
        // Update SVG
        const svg = document.getElementById('signatureSvg');
        const text = document.getElementById('signatureText');
        
        svg.setAttribute('viewBox', `0 0 ${size.width} ${size.height}`);
        svg.setAttribute('width', size.width);
        svg.setAttribute('height', size.height);
        
        text.setAttribute('x', size.width / 2);
        text.setAttribute('y', size.height / 2 + size.fontSize / 3);
        text.setAttribute('font-family', style.font);
        text.setAttribute('font-weight', style.weight);
        text.setAttribute('font-size', size.fontSize);
        text.setAttribute('fill', this.currentColor);
        text.setAttribute('class', style.class);
        text.textContent = this.userName;

        // Update info
        document.getElementById('styleName').textContent = style.name;
        document.getElementById('signatureLength').textContent = `${this.userName.length} characters`;
        document.getElementById('signatureComplexity').textContent = style.complexity;

        // Update analysis
        this.updateSignatureAnalysis();
    }

    updateSignatureAnalysis() {
        const style = this.signatureStyles[this.currentStyle];
        const analysisContent = document.getElementById('analysisContent');
        
        const insights = [
            `<strong>Style Analysis:</strong> ${style.personality}`,
            `<strong>Character Count:</strong> ${this.userName.length} characters - ${this.getComplexityAdvice()}`,
            `<strong>Color Psychology:</strong> ${this.getColorPsychology()}`,
            `<strong>Professional Rating:</strong> ${this.getProfessionalRating()}/10 for business use`
        ];

        analysisContent.innerHTML = insights.join('<br><br>');
    }

    getComplexityAdvice() {
        const length = this.userName.length;
        if (length < 8) return 'Short and memorable - perfect for quick signing';
        if (length < 15) return 'Ideal length for professional signatures';
        return 'Long signature - consider abbreviating for daily use';
    }

    getColorPsychology() {
        const colorMeanings = {
            '#000000': 'Black conveys authority, professionalism, and timeless elegance',
            '#1a365d': 'Navy blue suggests trustworthiness, stability, and corporate reliability',
            '#2563eb': 'Blue represents trust, communication, and dependability',
            '#dc2626': 'Red signifies passion, energy, and confidence',
            '#7c3aed': 'Purple indicates creativity, luxury, and uniqueness',
            '#d97706': 'Gold represents success, achievement, and premium quality'
        };
        return colorMeanings[this.currentColor] || 'Your chosen color reflects your personal style';
    }

    getProfessionalRating() {
        let rating = 7; // Base rating
        
        // Style bonus
        if (['serif', 'elegant', 'minimal'].includes(this.currentStyle)) rating += 2;
        if (['dancing', 'modern'].includes(this.currentStyle)) rating += 1;
        
        // Color bonus
        if (['#000000', '#1a365d', '#2563eb'].includes(this.currentColor)) rating += 1;
        
        // Length penalty
        if (this.userName.length > 20) rating -= 1;
        
        return Math.min(10, Math.max(6, rating));
    }

    async downloadSignature(format) {
        const style = this.signatureStyles[this.currentStyle];
        const size = this.sizeOptions[this.currentSize];
        
        try {
            if (format === 'svg') {
                this.downloadSVG();
            } else if (format === 'png') {
                await this.downloadPNG(true); // transparent
            } else if (format === 'jpg') {
                await this.downloadPNG(false); // white background
            }
            
            this.showToast(`${format.toUpperCase()} signature downloaded!`);
            this.incrementShareCount();
            
        } catch (error) {
            console.error('Download error:', error);
            this.showToast('Download failed. Please try again.', 'error');
        }
    }

    downloadSVG() {
        const style = this.signatureStyles[this.currentStyle];
        const size = this.sizeOptions[this.currentSize];
        
        const svgContent = `
            <svg width="${size.width}" height="${size.height}" viewBox="0 0 ${size.width} ${size.height}" 
                 xmlns="http://www.w3.org/2000/svg">
                <text x="${size.width / 2}" y="${size.height / 2 + size.fontSize / 3}" 
                      text-anchor="middle" 
                      font-family="${style.font}" 
                      font-weight="${style.weight}" 
                      font-size="${size.fontSize}" 
                      fill="${this.currentColor}">${this.userName}</text>
            </svg>
        `;
        
        const blob = new Blob([svgContent], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${this.userName.replace(/\s+/g, '_')}_signature.svg`;
        a.click();
        URL.revokeObjectURL(url);
    }

    async downloadPNG(transparent = true) {
        const style = this.signatureStyles[this.currentStyle];
        const size = this.sizeOptions[this.currentSize];
        
        const canvas = document.createElement('canvas');
        canvas.width = size.width * 2; // 2x for better quality
        canvas.height = size.height * 2;
        const ctx = canvas.getContext('2d');
        
        // Set background
        if (!transparent) {
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
        
        // Set text properties
        ctx.fillStyle = this.currentColor;
        ctx.font = `${style.weight} ${size.fontSize * 2}px ${style.font}, cursive`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // Add text shadow for better quality
        ctx.shadowColor = 'rgba(0,0,0,0.1)';
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;
        ctx.shadowBlur = 4;
        
        ctx.fillText(this.userName, canvas.width / 2, canvas.height / 2);
        
        // Download
        canvas.toBlob((blob) => {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${this.userName.replace(/\s+/g, '_')}_signature.${transparent ? 'png' : 'jpg'}`;
            a.click();
            URL.revokeObjectURL(url);
        }, transparent ? 'image/png' : 'image/jpeg', 0.9);
    }

    downloadAnimated() {
        // Create animated SVG showing signature being written
        const style = this.signatureStyles[this.currentStyle];
        const size = this.sizeOptions[this.currentSize];
        
        const svgContent = `
            <svg width="${size.width}" height="${size.height}" viewBox="0 0 ${size.width} ${size.height}" 
                 xmlns="http://www.w3.org/2000/svg">
                <style>
                    .signature-text {
                        font-family: ${style.font};
                        font-weight: ${style.weight};
                        font-size: ${size.fontSize}px;
                        fill: ${this.currentColor};
                        stroke: ${this.currentColor};
                        stroke-width: 1;
                        stroke-dasharray: 1000;
                        stroke-dashoffset: 1000;
                        animation: signature-draw 3s ease-in-out forwards;
                    }
                    @keyframes signature-draw {
                        to {
                            stroke-dashoffset: 0;
                            fill-opacity: 1;
                        }
                    }
                </style>
                <text x="${size.width / 2}" y="${size.height / 2 + size.fontSize / 3}" 
                      text-anchor="middle" class="signature-text">${this.userName}</text>
            </svg>
        `;
        
        const blob = new Blob([svgContent], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${this.userName.replace(/\s+/g, '_')}_signature_animated.svg`;
        a.click();
        URL.revokeObjectURL(url);
        
        this.showToast('Animated signature preview downloaded!');
    }

    showToast(message, type = 'success') {
        const toast = document.getElementById('toast');
        const toastMessage = document.getElementById('toastMessage');
        
        toastMessage.textContent = message;
        toast.className = `toast ${type}`;
        toast.classList.add('show');
        
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }

    // VIRAL FEATURES
    startViralNotifications() {
        const showNotification = () => {
            const city = this.globalCities[Math.floor(Math.random() * this.globalCities.length)];
            const styles = ['Elegant Script', 'Modern Casual', 'Executive Bold', 'Luxury Calligraphy'];
            const style = styles[Math.floor(Math.random() * styles.length)];
            
            const messages = [
                `Someone in ${city} just created a signature with ${style}`,
                `Professional in ${city} downloaded their ${style} signature`,
                `${city} user generated a perfect signature in ${style}`,
                `New signature created in ${city} using ${style} style`
            ];
            
            const message = messages[Math.floor(Math.random() * messages.length)];
            this.createViralNotification('🖋️', message, city);
            
            // Schedule next notification
            setTimeout(showNotification, Math.random() * 4000 + 3000); // 3-7 seconds
        };
        
        // Start notifications after 2 seconds
        setTimeout(showNotification, 2000);
    }

    createViralNotification(icon, message, location) {
        const container = document.getElementById('viralNotifications');
        const notification = document.createElement('div');
        notification.className = 'viral-notification';
        
        notification.innerHTML = `
            <span class="notification-icon">${icon}</span>
            <div class="notification-text">
                ${message}
                <div class="notification-location">${location}</div>
            </div>
        `;
        
        container.appendChild(notification);
        
        // Animate in
        setTimeout(() => notification.classList.add('show'), 100);
        
        // Remove after 5 seconds
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 5000);
        
        // Keep max 3 notifications
        const notifications = container.querySelectorAll('.viral-notification');
        if (notifications.length > 3) {
            notifications[0].remove();
        }
    }

    startCounterAnimation() {
        const counter = document.getElementById('totalSignatures');
        let current = parseInt(counter.textContent.replace(/,/g, ''));
        
        const increment = () => {
            current += Math.floor(Math.random() * 3) + 1; // 1-3 signatures per update
            counter.textContent = current.toLocaleString();
            setTimeout(increment, Math.random() * 5000 + 10000); // 10-15 seconds
        };
        
        setTimeout(increment, 5000);
    }

    loadShareCount() {
        this.shareCount = parseInt(localStorage.getItem('signatureShares') || '0');
    }

    incrementShareCount() {
        this.shareCount++;
        localStorage.setItem('signatureShares', this.shareCount.toString());
        
        // Show milestone rewards
        if (this.shareCount === 5) {
            this.showToast('🏆 Achievement: 5 signatures created!', 'success');
        } else if (this.shareCount === 10) {
            this.showToast('🌟 Expert Level: 10 signatures mastered!', 'success');
        } else if (this.shareCount === 25) {
            this.showToast('💎 Signature Pro: 25 creations unlocked!', 'success');
        }
    }
}

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    window.signatureGenerator = new SignatureGeneratorPro();
});