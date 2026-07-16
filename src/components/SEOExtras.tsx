import React, { useState } from 'react';
import { Check, X, Shield, Zap, Sparkles, Scale, AlertCircle } from 'lucide-react';

interface SEOExtrasProps {
  lang: string;
  theme: 'light' | 'dark';
}

export function SEOExtras({ lang, theme }: SEOExtrasProps) {
  const isHindi = lang === 'hi';

  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  // Competitor Comparison Data
  const competitors = [
    {
      name: 'ImgRunner',
      isHero: true,
      price: isHindi ? '100% मुफ्त (कोई छिपी फीस नहीं)' : '100% Free (No Ads, No Pro)',
      privacy: isHindi ? '🔒 100% ऑन-डिवाइस (फ़ाइलें सर्वर पर नहीं जातीं)' : '🔒 On-Device (Files never leave device)',
      batchSize: isHindi ? 'एक बार में 50 इमेज (ZIP डाउनलोड)' : 'Up to 50 Images (ZIP export)',
      kbTarget: isHindi ? '✓ स्मार्ट बाइनरी सर्च (सटीक KB टार्गेट)' : '✓ Auto Binary-Search (Precise KB matching)',
      heic: '✓ Yes (iPhone HEIC to JPG/PNG)',
      exif: isHindi ? '✓ स्वचालित (सुरक्षा के लिए EXIF डेटा हटाएँ)' : '✓ Automatic EXIF & GPS cleaner',
      login: isHindi ? '✗ कोई लॉगिन या साइनअप नहीं' : '✗ No Account / Login required',
      watermark: isHindi ? '✗ कोई वॉटरमार्क नहीं' : '✗ Zero Watermarks'
    },
    {
      name: 'iLoveIMG',
      price: isHindi ? 'सीमित मुफ्त (विज्ञापनों के साथ, प्रीमियम आवश्यक)' : 'Limited Free (Heavy Ads, Paid Pro tier)',
      privacy: isHindi ? '⚠ सर्वर पर अपलोड (क्लाउड प्रोसेसिंग)' : '⚠ Cloud Upload (Processed on external servers)',
      batchSize: isHindi ? 'सीमित (मुफ्त उपयोगकर्ताओं के लिए धीमा)' : 'Limited (Slower queue for free tier)',
      kbTarget: isHindi ? '✗ केवल मैन्युअल स्लाइडर' : '✗ Manual slider only (Trial & Error)',
      heic: isHindi ? '⚠ केवल चुनिंदा फाइलें (कन्वर्टर अलग है)' : '⚠ Only via separate converter',
      exif: isHindi ? '✗ EXIF डेटा सेव रहता है' : '✗ Keeps metadata metadata',
      login: isHindi ? '⚠ प्रीमियम सुविधाओं के लिए लॉगिन' : '⚠ Prompt for Premium / login',
      watermark: isHindi ? '⚠ बड़े बैचों पर वॉटरमार्क' : '⚠ Limited batch exports'
    },
    {
      name: 'Adobe Express',
      price: isHindi ? 'सीमित (क्रेडिट और साइनअप आवश्यक)' : 'Free tier with Adobe Account required',
      privacy: isHindi ? '⚠ क्लाउड स्टोरेज और प्रोसेसिंग' : '⚠ Cloud Storage (Requires data upload)',
      batchSize: isHindi ? '✗ केवल एक इमेज' : '✗ One by one only (No bulk resize)',
      kbTarget: isHindi ? '✗ कोई KB आकार फ़िल्टर नहीं' : '✗ No custom KB target input',
      heic: isHindi ? '⚠ सिमित फॉर्मेट सपोर्ट' : '⚠ Conversion constraints',
      exif: isHindi ? '✗ EXIF क्लीनर नहीं है' : '✗ Metadata retained',
      login: isHindi ? '✓ Adobe अकाउंट अनिवार्य है' : '✓ Mandatory Adobe login',
      watermark: isHindi ? '⚠ प्रीमियम संस्करण पर वॉटरमार्क' : '⚠ Some presets locked'
    },
    {
      name: 'BulkResizePhotos',
      price: isHindi ? 'मुफ्त (भारी विज्ञापनों और ट्रैकर के साथ)' : 'Free but heavy Ad scripts & Trackers',
      privacy: '✓ Local Browser processing',
      batchSize: isHindi ? '✓ बड़ा बैच सपोर्ट' : '✓ Batch support',
      kbTarget: isHindi ? '⚠ केवल अनुमानित फाइल आकार' : '⚠ Approximate KB target only',
      heic: isHindi ? '✗ HEIC सपोर्ट सीमित है' : '✗ Weak/No native HEIC support',
      exif: isHindi ? '✗ मैन्युअल सेटिंग्स की जरूरत' : '✗ Complex setting configurations',
      login: isHindi ? '✗ कोई लॉगिन नहीं' : '✗ No Login',
      watermark: '✗ No Watermark'
    },
    {
      name: 'TinyPNG',
      price: isHindi ? 'केवल 20 इमेज मुफ्त' : 'Free up to 20 images only',
      privacy: isHindi ? '⚠ सर्वर पर अपलोड' : '⚠ Server Upload (Cloud-based)',
      batchSize: isHindi ? '✗ केवल 20 इमेज तक' : '✗ Max 20 images',
      kbTarget: isHindi ? '✗ कोई कस्टम आकार लक्ष्य नहीं' : '✗ Direct compression only',
      heic: isHindi ? '✗ HEIC सपोर्ट नहीं' : '✗ No HEIC Support',
      exif: isHindi ? '✗ EXIF सेव रहता है' : '✗ Retains metadata',
      login: isHindi ? '✗ लॉगिन की आवश्यकता नहीं' : '✗ No login',
      watermark: '✗ No Watermark'
    }
  ];

  // Detailed, high-word-count FAQ list (English & Hindi)
  const faqData = [
    {
      qEn: "How can I resize and compress images to exactly 20KB, 50KB or 100KB?",
      qHi: "इमेज का साइज ठीक 20KB, 50KB या 500KB में कैसे बदलें?",
      aEn: "ImgRunner features a unique serverless Binary-Search compression algorithm. When you toggle the 'Target File Size' option and enter your desired limit (e.g., 20 KB), our system automatically tests multiple image quality combinations on a virtual canvas in milliseconds. It identifies the highest quality setting that stays just under your required byte limit, saving you from manual trial-and-error slider adjustments.",
      aHi: "ImgRunner में एक विशेष 'टारगेट फ़ाइल आकार' (Target File Size) तकनीक है। जब आप इस विकल्प को चालू करते हैं और अपना आकार (जैसे कि 20 KB या 50 KB) लिखते हैं, तो हमारा टूल मिलीसेकंड में बैकग्राउंड में इमेज क्वालिटी का विश्लेषण करता है। यह स्वतः ही आपके तय किए गए KB के अंदर सबसे उत्तम क्वालिटी सेट कर देता है, जिससे आपको बार-बार मैन्युअल क्वालिटी बदलने की ज़रूरत नहीं पड़ती।"
    },
    {
      qEn: "Is my personal data safe? Do you store my photos or ID cards (Aadhaar, Passport, SSN)?",
      qHi: "क्या मेरा डेटा सुरक्षित है? क्या आप मेरी तस्वीरें या सरकारी दस्तावेज स्टोर करते हैं?",
      aEn: "Your privacy is our highest priority. Unlike other online converters that upload your photos to remote cloud servers, ImgRunner is 100% serverless. All file readings, crops, conversions, rotations, and compression operations are executed locally inside your browser sandbox using high-performance HTML5 Canvas and JavaScript APIs. No data ever leaves your device. It is completely safe to upload highly confidential documents, passport photos, signature scans, and government ID cards.",
      aHi: "आपकी निजता हमारी सर्वोच्च प्राथमिकता है। अन्य कनवर्टर वेबसाइटों के विपरीत, जो आपकी तस्वीरों को रिमोट क्लाउड सर्वर पर अपलोड करती हैं, ImgRunner 100% स्थानीय (On-device) है। सभी फाइल क्रॉपिंग, रिसाइजिंग और कंप्रेसिंग प्रक्रियाएं आपके ब्राउज़र के अंदर ही पूरी होती हैं। आपकी फाइलें कभी भी आपके डिवाइस से बाहर नहीं जातीं। आप निश्चिंत होकर आधार कार्ड, पैन कार्ड, पासपोर्ट फोटो और हस्ताक्षरों (Signature) को बिना किसी संकोच के रिसाइज कर सकते हैं।"
    },
    {
      qEn: "What are the passport photo requirements for online Indian government exam portals (UPSC, SSC, banking)?",
      qHi: "सरकारी नौकरी और परीक्षा फॉर्म (UPSC, SSC, Banking) के लिए फोटो का क्या साइज होना चाहिए?",
      aEn: "Most Indian online portals like UPSC, SSC, IBPS, and State PSC require passport photos with specific specifications: typically 3.5 cm × 4.5 cm (or 350 × 450 pixels) at 200 DPI, with a white background and a file size strictly between 20 KB to 50 KB. Scanned signatures are usually requested at 3.5 cm × 1.5 cm with a file size between 10 KB to 20 KB. ImgRunner provides dedicated 'UPSC Passport', 'UPSC Signature', and general 'Indian Passport' presets that automatically preconfigure these dimensions with one click.",
      aHi: "अधिकांश सरकारी पोर्टल जैसे कि UPSC, SSC, IBPS और स्टेट PSC के लिए पासपोर्ट फोटो की चौड़ाई 3.5 सेमी और ऊंचाई 4.5 सेमी (या 350 × 450 पिक्सल) 200 DPI पर व्हाइट बैकग्राउंड के साथ होनी चाहिए, और फ़ाइल का आकार 20 KB से 50 KB के बीच होना चाहिए। हस्ताक्षर (Signature) का साइज 10 KB से 20 KB होना चाहिए। ImgRunner में इनके लिए विशेष 'वन-क्लिक' प्रीसेट मौजूद हैं जो एक बटन दबाते ही साइज और KB सेट कर देते हैं।"
    },
    {
      qEn: "Can I batch-resize iPhone HEIC images and convert them to JPG/PNG directly?",
      qHi: "क्या मैं आईफोन (iPhone) के HEIC फोटो को एक साथ JPG या WebP में बदल सकता हूँ?",
      aEn: "Yes! iPhone devices default to saving photos in the high-efficiency HEIC format, which is unsupported on most government websites and exam portals. ImgRunner has full native HEIC decoder integration. You can upload up to 50 HEIC files in a single batch, customize your output configurations, and download them converted into high-compatibility JPG, WebP, or PNG formats packaged in a single ZIP file without any watermarks.",
      aHi: "हाँ! आईफोन के फोटो आमतौर पर उच्च-दक्षता HEIC प्रारूप में सहेजे जाते हैं, जो अधिकांश वेबसाइटों पर स्वीकार नहीं होते। ImgRunner में अंतर्निहित HEIC डिकोडर है। आप एक बार में 50 HEIC फाइलों तक को अपलोड कर सकते हैं, उन्हें JPG, WebP, या PNG में बदल सकते हैं, और वॉटरमार्क के बिना सीधे ZIP फ़ाइल के रूप में डाउनलोड कर सकते हैं।"
    },
    {
      qEn: "What does 'Strip EXIF & GPS Metadata' mean and why is it on by default?",
      qHi: "'स्ट्रिप EXIF और GPS मेटाडेटा' क्या है और यह क्यों चालू रहता है?",
      aEn: "Modern digital photos capture embedded metadata called EXIF (Exchangeable Image File Format) containing sensitive private information including exact GPS location coordinates, capture time, camera sensor model, and device serial numbers. Sharing these online exposes your private data. ImgRunner's security-first design automatically strips all metadata when rewriting your images, protecting your location and device privacy before you publish or upload them.",
      aHi: "आधुनिक डिजिटल फोटो में 'EXIF मेटाडेटा' नाम की छिपी जानकारी होती है, जिसमें फोटो खींचने की सटीक GPS लोकेशन, समय, और कैमरा मॉडल शामिल होते हैं। ऑनलाइन फोटो अपलोड करने पर कोई भी इस डेटा को पढ़ सकता है। ImgRunner सुरक्षा कारणों से रिसाइज की गई सभी फाइलों से इस डेटा को स्वतः ही हटा देता है, ताकि आपकी प्राइवेसी बनी रहे।"
    },
    {
      qEn: "Does resizing my images with ImgRunner lead to blurriness or compression artifacts?",
      qHi: "क्या इमेज को रिसाइज करने से फोटो धुंधली या ख़राब हो जाती है?",
      aEn: "ImgRunner utilizes advanced bi-cubic and Lanczos-style image interpolation filters via HTML5 Canvas context engines. When downscaling high-resolution photos, our algorithm smooths pixel artifacts and retains maximum clarity. If you are uploading documents (like Aadhaar, PAN card, or marksheets), our system ensures text stays sharp and legible, even at small compressed file sizes (like under 100 KB).",
      aHi: "नहीं! ImgRunner ब्राउज़र के अंदर उच्चतम गुणवत्ता वाले बाई-क्यूबिक इंटरपोलेशन (bi-cubic interpolation) फिल्टर का उपयोग करता है। जब फोटो का साइज छोटा किया जाता है, तो हमारा एल्गोरिथ्म पिक्सेल को सुचारू रूप से सेट करता है ताकि फोटो की स्पष्टता बनी रहे। यदि आप कोई मार्कशीट या दस्तावेज रिसाइज कर रहे हैं, तो उसका टेक्स्ट बिल्कुल साफ और पढ़ने योग्य रहेगा।"
    },
    {
      qEn: "How does batch-processing and ZIP export work on mobile devices (Android and iOS)?",
      qHi: "क्या यह मोबाइल फोन (Android/iPhone) पर भी काम करता है?",
      aEn: "Absolutely! ImgRunner is optimized for mobile browser environments (Chrome, Safari, Firefox). You can select multiple images from your phone library or camera, bulk-configure them, and download the output instantly. Since we wrap multiple files in a standard .zip archive, iOS (Files app) and Android can open and extract your processed images without requiring external utility software.",
      aHi: "हाँ, बिल्कुल! ImgRunner मोबाइल ब्राउज़र (जैसे क्रोम, सफारी) के लिए पूरी तरह अनुकूलित है। आप अपने फोन की गैलरी से एक साथ कई तस्वीरें चुन सकते हैं, उन्हें रिसाइज कर सकते हैं और ज़िप (.zip) फाइल डाउनलोड कर सकते हैं। एंड्रॉइड और आईफोन दोनों ही बिना किसी बाहरी ऐप के इस ज़िप फ़ाइल को आसानी से खोल सकते हैं।"
    }
  ];

  return (
    <div className="mt-20 space-y-16">
      {/* 1. Comparison Chart Container */}
      <section className="scroll-mt-20">
        <div className="mb-8 text-center sm:text-left">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 mb-2.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isHindi ? 'प्रतिस्पर्धा तुलना' : 'Unmatched Superiority'}</span>
          </div>
          <h2 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            {isHindi ? 'ImgRunner बनाम अन्य रिसाइज़र' : 'ImgRunner vs. Other Image Resizers'}
          </h2>
          <p className={`text-sm mt-2 max-w-2xl font-normal leading-relaxed ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
            {isHindi 
              ? 'देखें क्यों ImgRunner दुनिया भर के छात्रों, फॉर्म भरने वालों और डिजाइनरों की पहली पसंद है।' 
              : 'Discover why ImgRunner is the preferred tool for students, professionals, and developers worldwide.'}
          </p>
        </div>

        {/* Premium Table layout */}
        <div className={`overflow-x-auto rounded-3xl border ${
          theme === 'dark' ? 'bg-[#1e1f20]/40 border-[#2d2f31]' : 'bg-white border-gray-200/90 shadow-sm'
        }`}>
          <table className="w-full text-left border-collapse min-w-[760px]">
            <thead>
              <tr className={`border-b ${theme === 'dark' ? 'border-[#2d2f31]' : 'border-gray-100'}`}>
                <th className="p-4 sm:p-5 text-xs font-extrabold tracking-wider text-slate-400 uppercase w-[180px]">
                  {isHindi ? 'विशेषता / टूल' : 'Feature / Tool'}
                </th>
                {competitors.map((comp) => (
                  <th 
                    key={comp.name} 
                    className={`p-4 sm:p-5 text-sm font-black tracking-tight ${
                      comp.isHero 
                        ? 'text-blue-600 dark:text-blue-400 bg-blue-500/5' 
                        : 'text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      {comp.name}
                      {comp.isHero && (
                        <span className="text-[9px] font-extrabold bg-blue-500 text-white px-2 py-0.5 rounded-full uppercase tracking-wider scale-95">
                          Best
                        </span>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-[#2d2f31]/50">
              {/* Row 1: Price */}
              <tr>
                <td className="p-4 sm:p-5 text-xs font-bold text-slate-400 tracking-wide">
                  {isHindi ? 'कीमत / शुल्क' : 'Pricing & Costs'}
                </td>
                {competitors.map((comp) => (
                  <td 
                    key={comp.name} 
                    className={`p-4 sm:p-5 text-xs font-semibold ${
                      comp.isHero 
                        ? 'text-slate-800 dark:text-white bg-blue-500/5 font-extrabold' 
                        : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {comp.price}
                  </td>
                ))}
              </tr>

              {/* Row 2: Privacy */}
              <tr>
                <td className="p-4 sm:p-5 text-xs font-bold text-slate-400 tracking-wide">
                  {isHindi ? 'सुरक्षा और प्राइवेसी' : 'Data Privacy'}
                </td>
                {competitors.map((comp) => (
                  <td 
                    key={comp.name} 
                    className={`p-4 sm:p-5 text-xs font-semibold ${
                      comp.isHero 
                        ? 'text-green-600 dark:text-green-400 bg-blue-500/5 font-extrabold' 
                        : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {comp.privacy}
                  </td>
                ))}
              </tr>

              {/* Row 3: Batch size */}
              <tr>
                <td className="p-4 sm:p-5 text-xs font-bold text-slate-400 tracking-wide">
                  {isHindi ? 'एक साथ बैच रिसाइज' : 'Batch Size Limit'}
                </td>
                {competitors.map((comp) => (
                  <td 
                    key={comp.name} 
                    className={`p-4 sm:p-5 text-xs font-semibold ${
                      comp.isHero 
                        ? 'text-slate-800 dark:text-white bg-blue-500/5 font-extrabold' 
                        : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {comp.batchSize}
                  </td>
                ))}
              </tr>

              {/* Row 4: KB targeting */}
              <tr>
                <td className="p-4 sm:p-5 text-xs font-bold text-slate-400 tracking-wide">
                  {isHindi ? 'KB टार्गेट सेटिंग' : 'Target KB matching'}
                </td>
                {competitors.map((comp) => (
                  <td 
                    key={comp.name} 
                    className={`p-4 sm:p-5 text-xs font-semibold ${
                      comp.isHero 
                        ? 'text-blue-600 dark:text-blue-400 bg-blue-500/5 font-extrabold' 
                        : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {comp.kbTarget}
                  </td>
                ))}
              </tr>

              {/* Row 5: HEIC input */}
              <tr>
                <td className="p-4 sm:p-5 text-xs font-bold text-slate-400 tracking-wide">
                  {isHindi ? 'HEIC सपोर्ट (iPhone)' : 'iPhone HEIC Format'}
                </td>
                {competitors.map((comp) => (
                  <td 
                    key={comp.name} 
                    className={`p-4 sm:p-5 text-xs font-semibold ${
                      comp.isHero 
                        ? 'text-slate-800 dark:text-white bg-blue-500/5 font-extrabold' 
                        : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {comp.heic}
                  </td>
                ))}
              </tr>

              {/* Row 6: EXIF strip */}
              <tr>
                <td className="p-4 sm:p-5 text-xs font-bold text-slate-400 tracking-wide">
                  {isHindi ? 'EXIF / GPS रिमूवल' : 'EXIF / GPS Cleaning'}
                </td>
                {competitors.map((comp) => (
                  <td 
                    key={comp.name} 
                    className={`p-4 sm:p-5 text-xs font-semibold ${
                      comp.isHero 
                        ? 'text-slate-800 dark:text-white bg-blue-500/5 font-extrabold' 
                        : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {comp.exif}
                  </td>
                ))}
              </tr>

              {/* Row 7: Watermark */}
              <tr>
                <td className="p-4 sm:p-5 text-xs font-bold text-slate-400 tracking-wide">
                  {isHindi ? 'वॉटरमार्क' : 'Watermarks'}
                </td>
                {competitors.map((comp) => (
                  <td 
                    key={comp.name} 
                    className={`p-4 sm:p-5 text-xs font-semibold ${
                      comp.isHero 
                        ? 'text-green-600 dark:text-green-400 bg-blue-500/5 font-extrabold' 
                        : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {comp.watermark}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* 2. Expanded Premium FAQ Container */}
      <section className="scroll-mt-20">
        <div className="mb-8 text-center sm:text-left">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-green-500/10 text-green-600 dark:text-green-400 mb-2.5">
            <Scale className="w-3.5 h-3.5" />
            <span>{isHindi ? 'विस्तृत प्रश्न उत्तर' : 'Deep Knowledge Base'}</span>
          </div>
          <h2 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            {isHindi ? 'अक्सर पूछे जाने वाले गहरे सवाल' : 'Expert Image Resizing FAQ'}
          </h2>
          <p className={`text-sm mt-2 max-w-2xl font-normal leading-relaxed ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
            {isHindi 
              ? 'इमेज कंप्रेशन, सुरक्षा, सरकारी नियमों और हमारी अत्याधुनिक तकनीक के बारे में गहराई से जानें।' 
              : 'Learn how our local-first scaling, metadata protection, and target-size matching technologies work.'}
          </p>
        </div>

        {/* Dynamic Interactive FAQ List with modern accordion style */}
        <div className="space-y-4">
          {faqData.map((item, index) => {
            const isOpened = activeFaq === index;
            const question = isHindi ? item.qHi : item.qEn;
            const answer = isHindi ? item.aHi : item.aEn;

            return (
              <div 
                key={index} 
                className={`rounded-2xl border transition-all duration-300 overflow-hidden ${
                  isOpened 
                    ? theme === 'dark' 
                      ? 'bg-[#1e1f20] border-blue-500/30 ring-1 ring-blue-500/20' 
                      : 'bg-blue-50/20 border-blue-500/30 ring-1 ring-blue-500/10 shadow-sm'
                    : theme === 'dark'
                      ? 'bg-[#1e1f20]/40 border-[#2d2f31] hover:border-slate-700'
                      : 'bg-white border-gray-200/80 hover:border-gray-300 shadow-sm'
                }`}
              >
                <button
                  type="button"
                  onClick={() => setActiveFaq(isOpened ? null : index)}
                  className="w-full text-left p-5 sm:px-6 flex items-center justify-between gap-4 outline-none cursor-pointer group"
                >
                  <span className={`text-sm font-bold tracking-tight transition-colors ${
                    isOpened 
                      ? 'text-blue-600 dark:text-blue-400' 
                      : 'text-slate-800 dark:text-white group-hover:text-blue-500 dark:group-hover:text-blue-400'
                  }`}>
                    {question}
                  </span>
                  <span className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-black transition-all ${
                    isOpened 
                      ? 'bg-blue-600 text-white rotate-180' 
                      : 'bg-slate-100 dark:bg-[#131314] text-slate-500 dark:text-slate-400 group-hover:bg-blue-500/10 group-hover:text-blue-600'
                  }`}>
                    ↓
                  </span>
                </button>
                
                {/* Expandable Panel */}
                <div className={`transition-all duration-300 ease-in-out overflow-hidden ${
                  isOpened ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
                }`}>
                  <div className={`p-5 sm:px-6 pt-0 border-t text-xs sm:text-sm leading-relaxed font-normal ${
                    theme === 'dark' 
                      ? 'border-[#2d2f31]/50 text-slate-300 bg-black/10' 
                      : 'border-blue-500/5 text-slate-600 bg-blue-500/[0.01]'
                  }`}>
                    {answer}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. Ultra-Dense Semantic Directory Grid for Local Search & Regional Slang */}
      <section className="scroll-mt-20">
        <div className="mb-6 text-center sm:text-left">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 mb-2.5">
            <Zap className="w-3.5 h-3.5" />
            <span>{isHindi ? 'सर्च समाधान डायरेक्टरी' : 'Organic Search Intent Directory'}</span>
          </div>
          <h2 className="font-display text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            {isHindi ? 'सभी लोकप्रिय सर्च और लोकल स्लैश समाधान' : 'All Popular Image Resizer Search Queries & Solutions'}
          </h2>
          <p className={`text-xs sm:text-sm mt-1.5 max-w-2xl font-normal leading-relaxed ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
            {isHindi 
              ? 'आप गूगल या सोशल मीडिया पर कुछ भी ढूंढें, ImgRunner हर सवाल का मुफ़्त और असली समाधान है।' 
              : 'Whatever search terms you use, ImgRunner provides the ultimate serverless free solution instantly.'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Govt Exam Specifications */}
          <div className={`p-5 rounded-2xl border ${
            theme === 'dark' ? 'bg-[#1e1f20]/30 border-[#2d2f31]' : 'bg-white border-gray-200/95 shadow-sm'
          }`}>
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2 mb-3.5">
              <span>📄</span> {isHindi ? 'सरकारी नौकरी और परीक्षा प्रीसेट' : 'Govt Job & Exam Portals'}
            </h3>
            <ul className="space-y-2.5 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              <li className="flex items-start gap-1.5">
                <span className="text-blue-500">•</span>
                <span><strong>UPSC IAS/IFS Exam Form:</strong> Passport size photo (20-50 KB) and handwritten signature (10-20 KB) in JPG format.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-blue-500">•</span>
                <span><strong>SSC CGL / CHSL:</strong> Photo resizer with exact 3.5cm x 4.5cm dimension matching, under 20kb to 50kb limit.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-blue-500">•</span>
                <span><strong>IBPS / Banking Exams:</strong> Signature and thumb impression image size reducer online free.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-blue-500">•</span>
                <span><strong>NTA JEE / NEET Forms:</strong> Postcard size photo (4x6 inch) and category certificates (50KB - 300KB) PDF/JPG resizer.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-blue-500">•</span>
                <span><strong>State PSC (UPPSC, BPSC, MPPSC):</strong> Custom pixel and centimeter online signature converter.</span>
              </li>
            </ul>
          </div>

          {/* Card 2: Regional Slang & Local Questions */}
          <div className={`p-5 rounded-2xl border ${
            theme === 'dark' ? 'bg-[#1e1f20]/30 border-[#2d2f31]' : 'bg-white border-gray-200/95 shadow-sm'
          }`}>
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2 mb-3.5">
              <span>💬</span> {isHindi ? 'आम बोलचाल की स्थानीय सर्च' : 'Hinglish & Local Slang Queries'}
            </h3>
            <ul className="space-y-2.5 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              <li className="flex items-start gap-1.5">
                <span className="text-amber-500">•</span>
                <span><strong>फोटो का साइज कम करने वाला ऐप:</strong> Compress any image or document instantly without installing heavy apps.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-amber-500">•</span>
                <span><strong>20 KB me photo compress kaise kare:</strong> Use target file size converter with 1-click automatic precision.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-amber-500">•</span>
                <span><strong>Signature crop karne wala tool:</strong> Fast interactive crop with adjustable aspect ratios and borders.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-amber-500">•</span>
                <span><strong>Mobile photo ka size kaise ghataye:</strong> Optimized for mobile browsers with swift offline processing.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-amber-500">•</span>
                <span><strong>Bina quality kharab kiye photo compress:</strong> Lossless quality optimizer with Smart Bi-cubic resampling algorithms.</span>
              </li>
            </ul>
          </div>

          {/* Card 3: Free Power Utilities */}
          <div className={`p-5 rounded-2xl border ${
            theme === 'dark' ? 'bg-[#1e1f20]/30 border-[#2d2f31]' : 'bg-white border-gray-200/95 shadow-sm'
          }`}>
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2 mb-3.5">
              <span>⚡</span> {isHindi ? '100% फ्री और सुरक्षित फीचर्स' : 'Free & Serverless Power Features'}
            </h3>
            <ul className="space-y-2.5 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              <li className="flex items-start gap-1.5">
                <span className="text-emerald-500">•</span>
                <span><strong>iPhone HEIC to JPG Batch Converter:</strong> No need to convert files individually, upload up to 50 HEIC files in one go.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-emerald-500">•</span>
                <span><strong>Secure Passport Photo Maker:</strong> Crop and download with correct aspect ratios and customize the background color.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-emerald-500">•</span>
                <span><strong>Offline Data Sandbox Protection:</strong> Files never leave your local device, making it 100% safe for confidential IDs.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-emerald-500">•</span>
                <span><strong>No Daily Limit or Hidden Fees:</strong> Unlike commercial websites, we offer completely free high-speed batch exports.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-emerald-500">•</span>
                <span><strong>No Advertisements & Trackers:</strong> Cleanest user interface without popping up frustrating third-party ads.</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* 4. Deep Multilingual SEO Directory & Keyword Index */}
      <section className="scroll-mt-20 pt-4 border-t border-gray-500/10">
        <div className="mb-6 text-center sm:text-left">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 mb-2.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isHindi ? 'मल्टीलिंगुअल सर्च इंडेक्स' : 'Multilingual Keyword Index'}</span>
          </div>
          <h2 className="font-display text-lg sm:text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            {isHindi ? 'सभी भाषाओं और सर्च टर्म्स की कम्पलीट डायरेक्टरी' : 'Comprehensive Multilingual Search Term Directory'}
          </h2>
          <p className={`text-xs mt-1 max-w-2xl font-normal leading-relaxed ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
            {isHindi 
              ? 'गूगल सर्च रोबोट्स के लिए तैयार किया गया सबसे बड़ा कीवर्ड इंडेक्स ताकि कोई भी किसी भी भाषा या लोकल स्लैंग में सर्च करे, वो सीधे यहाँ पहुंचे।' 
              : 'Our ultimate target list of search variations, local slangs, and dimension presets indexed for search crawlers.'}
          </p>
        </div>

        {/* Directory Columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 text-left mt-4">
          {/* Col 1: KB and MB Sizes */}
          <div>
            <h4 className="text-xs font-bold text-[#1a73e8] dark:text-[#8ab4f8] tracking-wider uppercase mb-3">
              📐 Exact KB & MB Targets
            </h4>
            <div className="flex flex-wrap gap-1.5 max-h-[250px] overflow-y-auto pr-1">
              {[
                'image compressor to 10kb', 'image compressor to 20kb', 'image compressor to 30kb', 'image compressor to 50kb',
                'image compressor to 100kb', 'image compressor to 150kb', 'image compressor to 200kb', 'image compressor to 500kb',
                'photo compress 10kb', 'photo compress 20kb', 'photo compress 30kb', 'photo compress 50kb', 'photo compress 100kb',
                'photo compress 150kb', 'photo compress 200kb', 'photo compress 500kb', 'photo compress 1mb', 'photo compress 2mb',
                'photo size reducer 10kb', 'photo size reducer 20kb', 'photo size reducer 30kb', 'photo size reducer 50kb',
                'photo size reducer 100kb', 'photo size reducer 150kb', 'photo size reducer 200kb', 'photo size reducer 500kb',
                'compress photo to 10kb', 'compress photo to 20kb', 'compress photo to 30kb', 'compress photo to 50kb',
                'compress photo to 100kb', 'compress photo to 150kb', 'compress photo to 200kb', 'compress photo to 500kb',
                'reduce photo size to 10kb', 'reduce photo size to 20kb', 'reduce photo size to 30kb', 'reduce photo size to 50kb',
                'reduce photo size to 100kb', 'reduce photo size to 150kb', 'reduce photo size to 200kb', 'reduce photo size to 500kb',
                'convert 2mb to 100kb', 'convert 5mb to 100kb', 'convert 2mb to 50kb', 'convert 5mb to 50kb', 'convert 1mb to 20kb',
                'compress image under 20kb', 'compress image under 50kb', 'compress image under 100kb', 'compress image under 200kb',
                'compress jpeg to 20kb', 'compress jpeg to 50kb', 'compress jpeg to 100kb', 'compress jpeg to 150kb', 'compress jpeg to 200kb',
                'compress png to 20kb', 'compress png to 50kb', 'compress png to 100kb', 'compress png to 150kb', 'compress png to 200kb'
              ].map((term) => (
                <span key={term} className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-[#131314] text-slate-600 dark:text-slate-400 border border-slate-200/50 dark:border-[#2d2f31]/50 cursor-pointer hover:border-[#1a73e8]">
                  {term}
                </span>
              ))}
            </div>
          </div>

          {/* Col 2: Local Slangs & Hinglish */}
          <div>
            <h4 className="text-xs font-bold text-amber-600 dark:text-amber-400 tracking-wider uppercase mb-3">
              💬 Local Slangs & Hinglish
            </h4>
            <div className="flex flex-wrap gap-1.5 max-h-[250px] overflow-y-auto pr-1">
              {[
                'photo ka size kaise kam kare', 'photo size kam karne ka tarika', 'photo size chota kaise kare', 'photo ka size chota kaise kare',
                'photo compress kaise kare', 'image size kam kaise kare', 'photo ko 20kb me kaise kare', 'photo ko 50kb me kaise kare',
                'photo ko 100kb me kaise convert kare', 'mobile se photo ka size kaise kam kare', 'photo ka weight kaise kam kare',
                'signature crop kaise kare', 'online photo compress kaise kare free', 'photo resizer app bina download kiye',
                'bina quality kharab kiye photo compress', 'document ka size kaise ghataye', 'aadhar card size reducer online',
                'pan card photo crop kaise kare', 'mobile photo compress krne ka tarika', 'photo size 50 kb se kam kaise kare',
                'image compress karna hai', 'photo size ghatao online', 'photo chota karne ka online web', 'free software photo resizer',
                'photo compressor 20 kb to 50 kb', 'how to resize photo to 20kb', 'how to compress photo to 50kb',
                'photo compressor online hindi', 'photo compress software free'
              ].map((term) => (
                <span key={term} className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-[#131314] text-slate-600 dark:text-slate-400 border border-slate-200/50 dark:border-[#2d2f31]/50 cursor-pointer hover:border-amber-500">
                  {term}
                </span>
              ))}
            </div>
          </div>

          {/* Col 3: Indian Regional Languages */}
          <div>
            <h4 className="text-xs font-bold text-emerald-600 dark:text-emerald-400 tracking-wider uppercase mb-3">
              🇮🇳 Indian Regional Searches
            </h4>
            <div className="flex flex-wrap gap-1.5 max-h-[250px] overflow-y-auto pr-1">
              {[
                'फोटोचा आकार कमी करा', 'फोटो कॉम्प्रेस करा ऑनलाइन', 'फोटो साइज कमी करणे २५ केबी', 'इमेज कॉम्प्रेस २० केबी', 'स्वाक्षरी क्रॉप आणि कॉम्प्रेस', 'शासकीय फॉर्म फोटो साईझ',
                'छবির সাইজ কমানো ২০ কেবি', 'ফটো কম্প্রেস ৫০ কেবি', 'অনলাইন ইমেজ সাইজ কমানো', 'পাসপোর্ট সাইজ ফটো রিসাইজার', 'স্বাক্ষর ক্রপ অনলাইন',
                'புகைப்பட அளவு குறைப்பான்', 'இமேஜ் கம்ப்ரஸர் ஆன்லைன்', 'பாஸ்போர்ட் அளவு புகைப்பட ரிசைசர்', 'கையொப்பம் பயிர் மற்றும் சுருக்கு', '20kb புகைப்பட அமுக்கி',
                'ఫోటో సైజ్ తగ్గించడం ఎలా', 'ఇమేజ్ కంప్రెసర్ ఆన్‌లైన్ 20kb', 'సంతకం క్రాప్ ఆన్‌లైన్', 'పాస్‌పోర్ట్ ఫోటో సైజ్ కన్వర్టర్',
                'ಫೋಟೋ ಗಾತ್ರ ಕಡಿಮೆ ಮಾಡುವುದು', 'ಇಮೇಜ್ ಕಂಪ್ರೆಸರ್ ಆನ್‌ಲೈನ್', 'ಸಹಿ ಕ್ರಾಪ್ ಆನ್‌ಲೈನ್',
                'تصویر کا سائز کم کریں', 'فٹو کا سائز گھٹائیں', 'ਫੋਟো ਦਾ ਸਾਈਜ਼ ਘਟਾਓ',
                'ফ্রি অনলাইন ফটো রিসাইজার', 'फोटो रिसाइजर ऐप डाउनलोड', 'ऑनलाइन फोटो कम कॉम्प्रेस'
              ].map((term) => (
                <span key={term} className="text-[10px] px-2 py-0.5 rounded bg-slate-100 dark:bg-[#131314] text-slate-600 dark:text-slate-400 border border-slate-200/50 dark:border-[#2d2f31]/50 cursor-pointer hover:border-emerald-500">
                  {term}
                </span>
              ))}
            </div>
          </div>

          {/* Col 4: Exam Specific & Form Portals */}
          <div>
            <h4 className="text-xs font-bold text-purple-600 dark:text-purple-400 tracking-wider uppercase mb-3">
              🎓 Exam & Portal Specifications
            </h4>
            <div className="flex flex-wrap gap-1.5 max-h-[250px] overflow-y-auto pr-1">
              {[
                'upsc passport photo white background resizer', 'upsc online registration signature size converter', 'ssc chsl photo resizer 3.5x4.5 cm',
                'ssc signature upload size reducer 10kb', 'ibps banking candidate passport cropper', 'gate application photo aspect ratio lock',
                'neet 4x6 postcard photo resizer', 'nta exam form marksheets image size reducer', 'passport photo dimensions 350 x 450 pixels',
                'signature dimensions 350 x 120 pixels', 'aadhaar card back and front joiner resizer', 'pan card official signature size online',
                'driving license photo dimension converter', 'provident fund pf image size reducer', 'visa photo specifications resizer online',
                'sbi clk photo resize tool', 'rrc group d signature dimensions', 'pan card correction photo converter', 'passport size photo maker 3.5 x 4.5 cm'
              ].map((term) => (
                <span key={term} className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-[#131314] text-slate-600 dark:text-slate-400 border border-slate-200/50 dark:border-[#2d2f31]/50 cursor-pointer hover:border-purple-500">
                  {term}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* SEO rich semantic keywords helper for organic searches */}
      <footer className="pt-8 border-t border-gray-500/10 text-center">
        <p className={`text-[10px] font-medium tracking-wide uppercase ${theme === 'dark' ? 'text-slate-600' : 'text-slate-400'}`}>
          Popular Search Intents Covered:
        </p>
        <div className="flex flex-wrap justify-center gap-x-3 gap-y-1.5 mt-2 max-w-4xl mx-auto">
          {[
            'image-compressor-under-20kb',
            'passport-photo-maker-3.5x4.5cm',
            'upsc-online-form-photo-size',
            'ssc-signature-size-reducer-10kb',
            'convert-heic-to-jpg-bulk-free',
            'remove-exif-metadata-online-safe',
            'free-bulk-webp-image-converter',
            'pan-card-signature-resizer-online',
            'compress-image-to-exact-size-in-kb',
            'photo-ka-size-kaise-kam-kare',
            'फोटो-का-साइज-छोटा-करें-ऑनलाइन'
          ].map((intent) => (
            <span key={intent} className="text-[10px] font-mono text-slate-500 dark:text-slate-500 hover:text-blue-500 cursor-help">
              #{intent}
            </span>
          ))}
        </div>
      </footer>
    </div>
  );
}
