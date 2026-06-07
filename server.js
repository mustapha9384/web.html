const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

const statsFilePath = path.join(__dirname, 'stats.json');

// دالة قراءة الإحصائيات المشتركة من السيرفر
function readStats() {
    try {
        if (!fs.existsSync(statsFilePath)) {
            return { totalImagesRemoved: 0, todayLogins: 0, lastResetDate: new Date().toDateString() };
        }
        const data = fs.readFileSync(statsFilePath, 'utf8');
        let stats = JSON.parse(data);
        
        // تصفير عداد اليوم التلقائي إذا تغير التاريخ
        const today = new Date().toDateString();
        if (stats.lastResetDate !== today) {
            stats.todayLogins = 0;
            stats.lastResetDate = today;
            saveStats(stats);
        }
        return stats;
    } catch (error) {
        return { totalImagesRemoved: 0, todayLogins: 0, lastResetDate: new Date().toDateString() };
    }
}

// دالة حفظ الإحصائيات
function saveStats(stats) {
    fs.writeFileSync(statsFilePath, JSON.stringify(stats, null, 2), 'utf8');
}

app.use(express.json());

// تمكين قراءة الملفات الثابتة من مجلد public
app.use(express.static(path.join(__dirname, 'public')));

// حل مشكلة (Cannot GET /): توجيه السيرفر لعرض ملف index.html مباشرة عند فتح الرابط الأساسي
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// الـ APIs الخاصة بلوحة التحكم بالإحصائيات العامة للكل
app.get('/api/stats', (req, res) => {
    const stats = readStats();
    res.json({
        totalImagesRemoved: stats.totalImagesRemoved,
        todayLogins: stats.todayLogins
    });
});

app.post('/api/stats/login', (req, res) => {
    let stats = readStats();
    stats.todayLogins++;
    saveStats(stats);
    res.json({ success: true, todayLogins: stats.todayLogins });
});

app.post('/api/stats/image', (req, res) => {
    let stats = readStats();
    stats.totalImagesRemoved++;
    saveStats(stats);
    res.json({ success: true, totalImagesRemoved: stats.totalImagesRemoved });
});

app.listen(PORT, () => {
    console.log(`Server is running successfully on port ${PORT}`);
});
