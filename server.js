const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();

const statsFilePath = path.join(__dirname, 'stats.json');

// دالة لقراءة الإحصائيات العامة من السيرفر
function readStats() {
    try {
        if (!fs.existsSync(statsFilePath)) {
            return { totalImagesRemoved: 0, todayLogins: 0, lastResetDate: new Date().toDateString() };
        }
        const data = fs.readFileSync(statsFilePath, 'utf8');
        let stats = JSON.parse(data);
        
        // تصفير عداد اليوم إذا تغير التاريخ
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

// دالة لحفظ الإحصائيات
function saveStats(stats) {
    fs.writeFileSync(statsFilePath, JSON.stringify(stats, null, 2), 'utf8');
}

// تفعيل استقبال بيانات JSON في السيرفر
app.use(express.json());

// تمكين قراءة الملفات من المجلد الرئيسي (إذا كان لديك ملفات css أو صور خارجية)
app.use(express.static(__dirname));

// عرض صفحتك الأساسية عند فتح الموقع
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'dashboard.html'));
});

// ━━━ APIs الإحصائيات العامة والمنفصلة لجميع الزوار ━━━

// API جلب الأرقام الحالية للكل
app.get('/api/stats', (req, res) => {
    const stats = readStats();
    res.json({
        totalImagesRemoved: stats.totalImagesRemoved,
        todayLogins: stats.todayLogins
    });
});

// API زيادة عداد الدخول اليومي
app.post('/api/stats/login', (req, res) => {
    let stats = readStats();
    stats.todayLogins++;
    saveStats(stats);
    res.json({ success: true, todayLogins: stats.todayLogins });
});

// API زيادة عداد الصور المحذوفة خلفيتها
app.post('/api/stats/image', (req, res) => {
    let stats = readStats();
    stats.totalImagesRemoved++;
    saveStats(stats);
    res.json({ success: true, totalImagesRemoved: stats.totalImagesRemoved });
});

app.listen(process.env.PORT || 3000, () => {
    console.log("Server is running successfully!");
});
