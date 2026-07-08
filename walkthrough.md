# Walkthrough: Dak Management Portal Setup

डाक संचालन पोर्टल (Dak Management Portal) के लिए Vite + React + Tailwind CSS v4 + Supabase संरचना का इनिशियलाइज़ेशन और कोड बेस का बुनियादी सेटअप सफलतापूर्वक पूरा कर लिया गया है।

---

## 1. बनाये गए महत्वपूर्ण फ़ाइल्स और कंपोनेंट्स की सूची

नीचे उन फाइलों की सूची दी गई है जिन्हें वर्कस्पेस में बनाया गया है:

| फ़ाइल पाथ | उद्देश्य |
| :--- | :--- |
| [tailwind.config.js](./tailwind.config.js) | Tailwind CSS थीम सेटिंग्स (पुलिस नेवी ब्लू, गोल्ड/खाकी और रेड एक्सेंट कलर्स के साथ)। |
| [postcss.config.js](./postcss.config.js) | Tailwind v4 संगत PostCSS कॉन्फ़िगरेशन। |
| [src/index.css](./src/index.css) | Tailwind v4 इम्पोर्ट्स और कस्टम पुलिस थीम ग्रेडिएंट व ग्लो शैडो क्लासेस। |
| [src/services/supabase.js](./src/services/supabase.js) | Supabase क्लाइंट इनिशियलाइज़ेशन। |
| [src/services/auth.js](./src/services/auth.js) | ऑथेंटिकेशन लॉजिक और ऑफलाइन सिमुलेशन के लिए **Mock Users**। |
| [src/services/dak.js](./src/services/dak.js) | डाक अपलोड, अग्रेषण, निस्तारण, आख्या (ATR) प्रविष्टि, और विस्तृत ट्रैकिंग लॉजिक (स्थानीय LocalStorage फॉलबैक के साथ)। |
| [src/context/AuthContext.jsx](./src/context/AuthContext.jsx) | पूरे पोर्टल में उपयोगकर्ता की लॉगिन स्थिति और भूमिका (RBAC) साझा करने के लिए प्रोवाइडर। |
| [src/layouts/DashboardLayout.jsx](./src/layouts/DashboardLayout.jsx) | यूज़र मेटडेटा, सुंदर हेडर, रोल बैज और साइडबार नेविगेशन से लैस प्रीमियम डैशबोर्ड लेआउट। |
| [src/pages/Login.jsx](./src/pages/Login.jsx) | पुलिस पोर्टल लॉगिन स्क्रीन जिसमें डेवलपर्स के त्वरित परीक्षण के लिए **क्विक लॉगिन बटन्स** लगाए गए हैं। |
| [src/pages/AdminDashboard.jsx](./src/pages/AdminDashboard.jsx) | डाक शाखा (Admin) डैशबोर्ड जहाँ से नई प्रविष्टियाँ स्कैन करके भेजी जा सकती हैं। |
| [src/pages/InchargeDashboard.jsx](./src/pages/InchargeDashboard.jsx) | प्रभारी अधिकारी डैशबोर्ड जहाँ डाक समीक्षा, डॉक्यूमेंट रीडिंग और अधीनस्थों को कमेंट्स के साथ अग्रेषित करने की सुविधा है। |
| [src/pages/EmployeeDashboard.jsx](./src/pages/EmployeeDashboard.jsx) | कर्मचारी/स्टाफ डैशबोर्ड जहाँ प्राप्त डाक देखकर Action Taken Report (ATR) लिखकर उसे निस्तारित किया जाता है। |
| [src/pages/SearchTrack.jsx](./src/pages/SearchTrack.jsx) | एडवांस्ड खोज और समयरेखा (Timeline) ट्रैकिंग पेज। |
| [src/App.jsx](./src/App.jsx) | मुख्य राउटर फ़ाइल जो यूज़र की भूमिका के अनुसार रूट रिडायरेक्ट्स और सुरक्षित सीमाएं (Protected Routes) तय करती है। |

---

## 2. स्थानीय रूप से पोर्टल कैसे चलाएं?

पोर्टल को अपने लोकल सिस्टम पर चलाने के लिए इन निर्देशों का पालन करें:

1. **निर्भरताएँ इंस्टॉल करें:** (यह पहले ही की जा चुकी है, फिर भी पुष्टि के लिए):
   ```bash
   npm install
   ```

2. **डेवलपमेंट सर्वर शुरू करें:**
   ```bash
   npm run dev
   ```
   यह कमांड आपके ब्राउज़र में `http://localhost:5173` (या किसी अन्य पोर्ट) पर एक स्थानीय विकास सर्वर शुरू करेगा।

3. **लॉगिन और परीक्षण (Mock Authentication):**
   लॉगिन स्क्रीन पर पहुँचने के बाद, आप डेटाबेस कनेक्शन के बिना भी सीधे निम्नलिखित क्विक लॉगिन क्रेडेंशियल्स का उपयोग कर सकते हैं:
   * **डाक शाखा (Admin):** `admin@police.gov.in` (पासवर्ड: `password`)
   * **शाखा प्रभारी (In-charge):** `incharge@police.gov.in` (पासवर्ड: `password`)
   * **कर्मचारी/स्टाफ (Employee):** `employee@police.gov.in` (पासवर्ड: `password`)

---

## 3. संकलन और निर्माण परीक्षण (Build Verification)

प्रोजेक्ट के सभी कोड का संकलन जाँचने के लिए `npm run build` रन किया गया। इसका परिणाम सफलतापूर्वक संकलित और अनुकूलित फाइलों के रूप में मिला:

```text
✓ built in 1.14s
dist/index.html                   0.45 kB
dist/assets/index-sTsC_-ZA.css   35.20 kB
dist/assets/index-B6eDe7T0.js   507.33 kB
```
यह साबित करता है कि कोई सिंटैक्स त्रुटि या इम्पोर्ट समस्याएँ कोडबेस में नहीं हैं।
