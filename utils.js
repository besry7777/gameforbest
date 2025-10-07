/**
 * utils.js
 * * รวมฟังก์ชันช่วยเหลือที่ใช้บ่อยในส่วนต่างๆ ของโปรเจกต์
 */

/**
 * สร้าง String แบบสุ่มตามความยาวที่กำหนด
 * @param {number} length ความยาวของ String ที่ต้องการ
 * @returns {string} String ที่สุ่มได้
 */
const generateRandomId = (length) => {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
};

/**
 * แสดง Toast Notification พร้อมข้อความ
 * @param {string} message ข้อความที่จะแสดง
 */
const showToast = (message) => {
    const toast = document.getElementById('toast-notification');
    const toastMessage = document.getElementById('toast-message');
    
    if (!toast || !toastMessage) return;

    toastMessage.textContent = message;
    toast.style.opacity = '1';
    toast.style.transform = 'translateY(0)';

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(-10px)';
    }, 3000); // แสดงเป็นเวลา 3 วินาที
};

/**
 * ฟังก์ชันสำหรับสับเปลี่ยนตำแหน่งใน Array (ใช้สำหรับสุ่มลำดับ)
 * @param {Array} array 
 * @returns {Array} Array ที่สับตำแหน่งแล้ว
 */
const shuffleArray = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
};
