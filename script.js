// script.js

// Global variables for data storage (since localStorage is not available)
let inquiries = [];
let isAdminLoggedIn = false;

// Admin credentials (in real application, this should be securely handled)
const adminCredentials = {
    username: 'admin',
    password: 'rtf2024'
};

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    // Add smooth scrolling to navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Initialize contact form
    initializeContactForm();
    
    // Initialize admin functionality
    initializeAdminFunctions();
    
    // Add scroll effect to navbar
    window.addEventListener('scroll', handleNavbarScroll);
    
    // Add animation observers
    observeElements();
    
    // Sample data for demonstration
    addSampleInquiries();
}

function handleNavbarScroll() {
    const navbar = document.getElementById('navbar');
    if (window.scrollY > 100) {
        navbar.style.background = 'rgba(255, 255, 255, 0.98)';
        navbar.style.boxShadow = '0 2px 30px rgba(0, 0, 0, 0.15)';
    } else {
        navbar.style.background = 'rgba(255, 255, 255, 0.95)';
        navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
    }
}

function observeElements() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, { threshold: 0.1 });

    // Observe service cards
    document.querySelectorAll('.service-card').forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(50px)';
        card.style.transition = 'all 0.6s ease';
        observer.observe(card);
    });
}

function initializeContactForm() {
    const contactForm = document.getElementById('contactForm');
    contactForm.addEventListener('submit', handleContactSubmission);
}

function handleContactSubmission(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const inquiry = {
        id: Date.now(),
        name: formData.get('name'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        service: formData.get('service'),
        message: formData.get('message'),
        timestamp: new Date().toISOString(),
        status: 'new'
    };
    
    // Add to inquiries array
    inquiries.push(inquiry);
    
    // Show success message
    showMessage('Thank you for your inquiry! We will get back to you within 24 hours.', 'success');
    
    // Reset form
    e.target.reset();
    
    // Update admin dashboard if logged in
    if (isAdminLoggedIn) {
        updateDashboard();
    }
}

function showMessage(text, type) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.textContent = text;
    
    const form = document.getElementById('contactForm');
    form.insertBefore(messageDiv, form.firstChild);
    
    // Remove message after 5 seconds
    setTimeout(() => {
        messageDiv.remove();
    }, 5000);
}

function initializeAdminFunctions() {
    const adminForm = document.getElementById('adminForm');
    adminForm.addEventListener('submit', handleAdminLogin);
}

function toggleAdminLogin() {
    const modal = document.getElementById('adminModal');
    modal.style.display = modal.style.display === 'block' ? 'none' : 'block';
}

function handleAdminLogin(e) {
    e.preventDefault();
    
    const username = document.getElementById('adminUsername').value;
    const password = document.getElementById('adminPassword').value;
    
    if (username === adminCredentials.username && password === adminCredentials.password) {
        isAdminLoggedIn = true;
        toggleAdminLogin();
        showAdminDashboard();
        showMessage('Login successful!', 'success');
    } else {
        showMessage('Invalid credentials. Please try again.', 'error');
    }
}

function showAdminDashboard() {
    const dashboard = document.getElementById('adminDashboard');
    dashboard.style.display = 'block';
    updateDashboard();
}

function closeAdminDashboard() {
    const dashboard = document.getElementById('adminDashboard');
    dashboard.style.display = 'none';
    isAdminLoggedIn = false;
}

function updateDashboard() {
    // Update statistics
    document.getElementById('totalInquiries').textContent = inquiries.length;
    document.getElementById('loanInquiries').textContent = inquiries.filter(i => i.service === 'loan').length;
    document.getElementById('insuranceInquiries').textContent = inquiries.filter(i => i.service === 'insurance').length;
    document.getElementById('mutualFundInquiries').textContent = inquiries.filter(i => i.service === 'mutual-fund').length;
    
    // Update inquiries list
    const inquiriesList = document.getElementById('inquiriesList');
    inquiriesList.innerHTML = '';
    
    if (inquiries.length === 0) {
        inquiriesList.innerHTML = '<p>No inquiries yet.</p>';
        return;
    }
    
    // Show recent inquiries (last 10)
    const recentInquiries = inquiries.slice(-10).reverse();
    
    recentInquiries.forEach(inquiry => {
        const inquiryDiv = document.createElement('div');
        inquiryDiv.className = 'inquiry-item';
        inquiryDiv.innerHTML = `
            <strong>${inquiry.name}</strong> - ${inquiry.service || 'General'}<br>
            <small>Email: ${inquiry.email} | Phone: ${inquiry.phone}</small><br>
            <small>Date: ${new Date(inquiry.timestamp).toLocaleString()}</small><br>
            <p style="margin-top: 0.5rem;">${inquiry.message}</p>
        `;
        inquiriesList.appendChild(inquiryDiv);
    });
}

function downloadCSV() {
    if (inquiries.length === 0) {
        showMessage('No data to download.', 'error');
        return;
    }
    
    // Create CSV content
    const headers = ['ID', 'Name', 'Email', 'Phone', 'Service', 'Message', 'Date', 'Status'];
    const csvContent = [
        headers.join(','),
        ...inquiries.map(inquiry => [
            inquiry.id,
            `"${inquiry.name}"`,
            inquiry.email,
            inquiry.phone,
            inquiry.service || 'General',
            `"${inquiry.message.replace(/"/g, '""')}"`,
            new Date(inquiry.timestamp).toLocaleString(),
            inquiry.status
        ].join(','))
    ].join('\n');
    
    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `rtf_inquiries_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showMessage('CSV file downloaded successfully!', 'success');
}

function addSampleInquiries() {
    // Add some sample data for demonstration
    const sampleInquiries = [
        {
            id: 1001,
            name: 'Rajesh Kumar',
            email: 'rajesh.kumar@email.com',
            phone: '+91 98765 43210',
            service: 'loan',
            message: 'I am interested in a home loan. Please provide details about interest rates and eligibility criteria.',
            timestamp: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
            status: 'new'
        },
        {
            id: 1002,
            name: 'Priya Sharma',
            email: 'priya.sharma@email.com',
            phone: '+91 87654 32109',
            service: 'insurance',
            message: 'Looking for comprehensive health insurance for my family of 4. Please share options.',
            timestamp: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
            status: 'contacted'
        },
        {
            id: 1003,
            name: 'Amit Patel',
            email: 'amit.patel@email.com',
            phone: '+91 76543 21098',
            service: 'mutual-fund',
            message: 'Want to start SIP investment. New to mutual funds, need guidance on best options.',
            timestamp: new Date(Date.now() - 259200000).toISOString(), // 3 days ago
            status: 'processed'
        },
        {
            id: 1004,
            name: 'Sunita Gupta',
            email: 'sunita.gupta@email.com',
            phone: '+91 65432 10987',
            service: 'loan',
            message: 'Interested in personal loan for business expansion. Amount needed: 10 lakhs.',
            timestamp: new Date(Date.now() - 345600000).toISOString(), // 4 days ago
            status: 'new'
        },
        {
            id: 1005,
            name: 'Vikram Singh',
            email: 'vikram.singh@email.com',
            phone: '+91 54321 09876',
            service: 'insurance',
            message: 'Need motor insurance for new car. Looking for comprehensive coverage with good claim settlement.',
            timestamp: new Date(Date.now() - 432000000).toISOString(), // 5 days ago
            status: 'contacted'
        }
    ];
    
    inquiries.push(...sampleInquiries);
}

// Service card click handlers
document.addEventListener('DOMContentLoaded', function() {
    const serviceCards = document.querySelectorAll('.service-card');
    
    serviceCards.forEach(card => {
        card.addEventListener('click', function() {
            const service = this.getAttribute('data-service');
            scrollToContact(service);
        });
    });
});

function scrollToContact(service) {
    const contactSection = document.getElementById('contact');
    const serviceSelect = document.querySelector('select[name="service"]');
    
    // Scroll to contact section
    contactSection.scrollIntoView({ behavior: 'smooth' });
    
    // Pre-select the service
    setTimeout(() => {
        if (serviceSelect && service) {
            serviceSelect.value = service;
            serviceSelect.focus();
        }
    }, 1000);
}

// Close modals when clicking outside
window.addEventListener('click', function(event) {
    const adminModal = document.getElementById('adminModal');
    const dashboardModal = document.getElementById('adminDashboard');
    
    if (event.target === adminModal) {
        adminModal.style.display = 'none';
    }
    
    if (event.target === dashboardModal) {
        dashboardModal.style.display = 'none';
        isAdminLoggedIn = false;
    }
});

// Handle escape key to close modals
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        document.getElementById('adminModal').style.display = 'none';
        document.getElementById('adminDashboard').style.display = 'none';
        isAdminLoggedIn = false;
    }
});

// Add loading animation for form submissions
function addLoadingAnimation(button) {
    const originalText = button.textContent;
    button.textContent = 'Processing...';
    button.disabled = true;
    
    setTimeout(() => {
        button.textContent = originalText;
        button.disabled = false;
    }, 2000);
}

// Enhanced form validation
function validateForm(formData) {
    const errors = [];
    
    if (!formData.get('name') || formData.get('name').length < 2) {
        errors.push('Name must be at least 2 characters long');
    }
    
    const email = formData.get('email');
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
        errors.push('Please enter a valid email address');
    }
    
    const phone = formData.get('phone');
    const phoneRegex = /^[+]?[\d\s-()]{10,}$/;
    if (!phone || !phoneRegex.test(phone)) {
        errors.push('Please enter a valid phone number');
    }
    
    if (!formData.get('message') || formData.get('message').length < 10) {
        errors.push('Message must be at least 10 characters long');
    }
    
    return errors;
}

// Update contact form handler with validation
function handleContactSubmission(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const errors = validateForm(formData);
    
    if (errors.length > 0) {
        showMessage(errors.join('. '), 'error');
        return;
    }
    
    // Add loading animation
    const submitButton = e.target.querySelector('button[type="submit"]');
    addLoadingAnimation(submitButton);
    
    const inquiry = {
        id: Date.now(),
        name: formData.get('name'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        service: formData.get('service'),
        message: formData.get('message'),
        timestamp: new Date().toISOString(),
        status: 'new'
    };
    
    // Simulate processing delay
    setTimeout(() => {
        inquiries.push(inquiry);
        showMessage('Thank you for your inquiry! We will get back to you within 24 hours.', 'success');
        e.target.reset();
        
        if (isAdminLoggedIn) {
            updateDashboard();
        }
    }, 2000);
}