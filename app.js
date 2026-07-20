// ============== EDIT THESE TWO LINES ==============
  const OWNER_WHATSAPP = "919158818546"; // digits only, country code first
  const OWNER_PHONE     = "+919158818546";
  // =====================================================

  // ================= LANGUAGE TOGGLE (EN / HI / MR) =================
  // NOTE: translations below are a first draft — have a Hindi/Marathi
  // speaker review before relying on them for real customers.
  const I18N = {
    en: {
      heroEyebrow: "Nashik · Mumbai · Pune · all of India",
      heroH1: "Wherever the road goes, we're already on it.",
      heroSub: "Fixed routes between Nashik, Mumbai, Pune and Chhatrapati Sambhaji Nagar — or tell us your own destination anywhere in India. Same doorstep pickup, same fixed-fare promise, one WhatsApp message away.",
      heroCta1: "See fixed routes", heroCta2: "Choose your destination",
      routesEyebrow: "Fixed routes", routesH2: "Our regular runs",
      routesP: "Tap a route to fill it into the booking form below. Every route is fixed-fare — the price is confirmed on WhatsApp before you book.",
      availEyebrow: "Availability", availH2: "Check today's cars before you message us",
      availP: "Live status pulled from our booking sheet — pick a date to see what's actually free.",
      bookEyebrow: "Book a ride", bookH2: "Any of our fixed routes, or your own",
      bookP: "Pick a route above, or choose it here. Fill this in and it opens WhatsApp with everything pre-filled — just hit send. Prefer to talk? Call us straight from here.",
      toggleFixed: "Fixed route", toggleCustom: "Custom destination",
      labelRoute: "Choose your route", labelPickup: "Pickup location", labelDrop: "Drop location",
      labelDate: "Pickup date", labelTime: "Pickup time", labelTripType: "Trip type",
      tripOneWay: "One-way", tripRound: "Round trip", labelPassengers: "Passengers",
      labelPhone: "Your phone number", labelName: "Your name",
      btnSend: "Send booking on WhatsApp", btnCallInstead: "Or call instead",
      confirmMsg: "Opening WhatsApp with your details filled in — just tap send.",
      formNote: "We reply with a fixed quote before anything is confirmed. No advance payment needed to get a quote.",
      destH3: "Going somewhere else? Pick a popular one:", whyH3: "Why book direct with us",
      why1: "Fare confirmed on WhatsApp before you book — no surge, no surprise at drop-off.",
      why2: "Same driver, same car, owner-operated — not a call-centre dispatch.",
      why3: "Doorstep pickup in Nashik, Mumbai or Pune, drop anywhere in India.",
      why4: "One-way or round trip, your call — pay only for what you book.",
      fleetEyebrow: "Our cars", fleetH2: "Eight cars, one for every trip",
      fleetP: "From a quick solo hop to a full family outstation trip — pick what suits you when you book, or leave it to us.",
      trustEyebrow: "Safety", trustH2: "What we promise on every ride",
      trustP: "These are policy commitments — edit any line below if your actual practice differs.",
      trust1h: "Licensed drivers", trust1p: "Every driver holds a valid commercial driving license.",
      trust2h: "Maintained cars", trust2p: "Regular servicing — not a car that shows up unexpectedly rough.",
      trust3h: "Same driver, same car", trust3p: "No surprise handoffs to a different vehicle mid-route.",
      trust4h: "Direct contact", trust4p: "You reach the owner directly — not a call-centre queue.",
      faqEyebrow: "FAQ", faqH2: "Common questions",
      faqP: "General answers below — edit specifics (exact grace period, exact charges) to match your real policy.",
      faqQ1: "How much luggage can I bring?",
      faqA1: "One or two standard bags per passenger is fine in any of our cars. For extra-large loads, mention it when booking so we can assign the right car.",
      faqQ2: "Do you charge for waiting time?",
      faqA2: "A short grace period is included free. Beyond that, waiting charges may apply — ask us to confirm the exact policy when you book.",
      faqQ3: "Can I book a night or early morning pickup?",
      faqA3: "Yes — just mention the time when you book on WhatsApp so we can confirm a car is available for that slot.",
      faqQ4: "What if I need to cancel?",
      faqA4: "Let us know as early as possible on WhatsApp. Cancelling well before pickup time is usually no issue — very last-minute cancellations may be handled case by case.",
      faqQ5: "How do I pay?",
      faqA5: "We confirm the fare on WhatsApp before the trip. Payment is usually collected directly — ask us about your preferred method (cash/UPI) when booking.",
      faqQ6: "Will the fare change during the trip?",
      faqA6: "No — the fare we confirm on WhatsApp before you book is what you pay, unless the route or stops change from what was agreed.",
      footerTagline: "Owner-operated taxi service based in Nashik. Nashik–Pune daily, plus custom trips anywhere you need to go."
    },
    hi: {
      heroEyebrow: "नासिक · मुंबई · पुणे · पूरे भारत में",
      heroH1: "जहाँ भी सड़क जाए, हम वहाँ पहले से मौजूद हैं।",
      heroSub: "नासिक, मुंबई, पुणे और छत्रपति संभाजीनगर के बीच निश्चित रूट — या भारत में कहीं भी अपनी मंज़िल बताएं। वही डोरस्टेप पिकअप, वही तय किराए का वादा, सिर्फ़ एक व्हाट्सएप संदेश दूर।",
      heroCta1: "निश्चित रूट देखें", heroCta2: "अपनी मंज़िल चुनें",
      routesEyebrow: "निश्चित रूट", routesH2: "हमारे नियमित रूट",
      routesP: "नीचे बुकिंग फ़ॉर्म में भरने के लिए एक रूट पर टैप करें। हर रूट का किराया तय है — बुकिंग से पहले व्हाट्सएप पर कीमत तय होती है।",
      availEyebrow: "उपलब्धता", availH2: "संदेश भेजने से पहले आज की गाड़ियाँ देखें",
      availP: "हमारी बुकिंग शीट से लाइव स्थिति — यह देखने के लिए एक तारीख चुनें कि वास्तव में क्या खाली है।",
      bookEyebrow: "सवारी बुक करें", bookH2: "हमारे किसी भी निश्चित रूट पर, या अपनी पसंद से",
      bookP: "ऊपर एक रूट चुनें, या यहाँ चुनें। इसे भरें और यह सब कुछ पहले से भरा हुआ व्हाट्सएप खोलेगा — बस भेजें दबाएं। बात करना पसंद करें? यहीं से सीधे कॉल करें।",
      toggleFixed: "निश्चित रूट", toggleCustom: "अपनी पसंद की मंज़िल",
      labelRoute: "अपना रूट चुनें", labelPickup: "पिकअप स्थान", labelDrop: "ड्रॉप स्थान",
      labelDate: "पिकअप तारीख", labelTime: "पिकअप समय", labelTripType: "यात्रा प्रकार",
      tripOneWay: "एक तरफ़ा", tripRound: "राउंड ट्रिप", labelPassengers: "यात्री",
      labelPhone: "आपका फ़ोन नंबर", labelName: "आपका नाम",
      btnSend: "व्हाट्सएप पर बुकिंग भेजें", btnCallInstead: "या कॉल करें",
      confirmMsg: "आपकी जानकारी भरकर व्हाट्सएप खुल रहा है — बस भेजें दबाएं।",
      formNote: "कुछ भी तय होने से पहले हम एक निश्चित कीमत के साथ जवाब देंगे। कीमत जानने के लिए कोई अग्रिम भुगतान ज़रूरी नहीं है।",
      destH3: "कहीं और जाना है? एक लोकप्रिय जगह चुनें:", whyH3: "सीधे हमसे बुक क्यों करें",
      why1: "बुकिंग से पहले व्हाट्सएप पर किराया तय — कोई सर्ज नहीं, ड्रॉप पर कोई आश्चर्य नहीं।",
      why2: "वही ड्राइवर, वही गाड़ी, मालिक द्वारा संचालित — कॉल-सेंटर डिस्पैच नहीं।",
      why3: "नासिक, मुंबई या पुणे में डोरस्टेप पिकअप, भारत में कहीं भी ड्रॉप।",
      why4: "एक तरफ़ा या राउंड ट्रिप, आपकी पसंद — जो बुक करें उसी का भुगतान करें।",
      fleetEyebrow: "हमारी गाड़ियाँ", fleetH2: "आठ गाड़ियाँ, हर यात्रा के लिए एक",
      fleetP: "एक छोटी अकेली यात्रा से लेकर पूरे परिवार की आउटस्टेशन ट्रिप तक — बुकिंग के समय जो उपयुक्त हो चुनें, या हम पर छोड़ दें।",
      trustEyebrow: "सुरक्षा", trustH2: "हर सवारी पर हमारा वादा",
      trustP: "ये नीतिगत प्रतिबद्धताएँ हैं — यदि आपकी वास्तविक प्रथा अलग है तो नीचे कोई भी पंक्ति संपादित करें।",
      trust1h: "लाइसेंसधारी ड्राइवर", trust1p: "हर ड्राइवर के पास वैध व्यावसायिक ड्राइविंग लाइसेंस है।",
      trust2h: "रखरखाव वाली गाड़ियाँ", trust2p: "नियमित सर्विसिंग — कोई ऐसी गाड़ी नहीं जो अचानक ख़राब हालत में आए।",
      trust3h: "वही ड्राइवर, वही गाड़ी", trust3p: "रास्ते में किसी दूसरी गाड़ी में अचानक बदलाव नहीं।",
      trust4h: "सीधा संपर्क", trust4p: "आप सीधे मालिक से संपर्क करते हैं — कॉल-सेंटर की कतार नहीं।",
      faqEyebrow: "सामान्य प्रश्न", faqH2: "सामान्य सवाल",
      faqP: "नीचे सामान्य उत्तर दिए गए हैं — अपनी वास्तविक नीति के अनुसार विवरण (सही छूट अवधि, सही शुल्क) संपादित करें।",
      faqQ1: "मैं कितना सामान ला सकता हूँ?",
      faqA1: "हर यात्री के लिए एक या दो सामान्य बैग किसी भी गाड़ी में ठीक हैं। अतिरिक्त बड़े सामान के लिए, बुकिंग के समय बताएं ताकि हम सही गाड़ी दे सकें।",
      faqQ2: "क्या प्रतीक्षा समय के लिए शुल्क लगता है?",
      faqA2: "थोड़ी छूट अवधि मुफ़्त शामिल है। उसके बाद प्रतीक्षा शुल्क लग सकता है — बुकिंग के समय सही नीति की पुष्टि करने के लिए पूछें।",
      faqQ3: "क्या मैं रात या सुबह जल्दी पिकअप बुक कर सकता हूँ?",
      faqA3: "हाँ — बस व्हाट्सएप पर बुकिंग के समय समय बताएं ताकि हम उस समय के लिए गाड़ी की पुष्टि कर सकें।",
      faqQ4: "अगर मुझे रद्द करना पड़े तो?",
      faqA4: "जितनी जल्दी हो सके व्हाट्सएप पर बताएं। पिकअप समय से काफ़ी पहले रद्द करना आमतौर पर कोई समस्या नहीं है — बहुत आख़िरी समय पर रद्द करने को अलग-अलग तरीके से देखा जा सकता है।",
      faqQ5: "मैं भुगतान कैसे करूँ?",
      faqA5: "हम यात्रा से पहले व्हाट्सएप पर किराया तय करते हैं। भुगतान आमतौर पर सीधे लिया जाता है — बुकिंग के समय अपनी पसंदीदा विधि (नकद/यूपीआई) के बारे में पूछें।",
      faqQ6: "क्या यात्रा के दौरान किराया बदल सकता है?",
      faqA6: "नहीं — बुकिंग से पहले व्हाट्सएप पर तय किया गया किराया ही आप देते हैं, जब तक कि रूट या स्टॉप सहमति से अलग न हों।",
      footerTagline: "नासिक में आधारित मालिक-संचालित टैक्सी सेवा। रोज़ाना नासिक–पुणे, साथ ही जहाँ भी आपको जाना हो वहाँ की कस्टम यात्राएं।"
    },
    mr: {
      heroEyebrow: "नाशिक · मुंबई · पुणे · संपूर्ण भारतात",
      heroH1: "रस्ता जिथे जाईल, तिथे आम्ही आधीच आहोत.",
      heroSub: "नाशिक, मुंबई, पुणे आणि छत्रपती संभाजीनगर दरम्यान ठरलेले मार्ग — किंवा भारतात कुठेही तुमचे ठिकाण सांगा. तेच घरपोच पिकअप, तेच ठरलेल्या भाड्याचे वचन, फक्त एका व्हॉट्सअॅप मेसेजच्या अंतरावर.",
      heroCta1: "ठरलेले मार्ग पाहा", heroCta2: "तुमचे ठिकाण निवडा",
      routesEyebrow: "ठरलेले मार्ग", routesH2: "आमचे नियमित मार्ग",
      routesP: "खालील बुकिंग फॉर्ममध्ये भरण्यासाठी एका मार्गावर टॅप करा. प्रत्येक मार्गाचे भाडे ठरलेले आहे — बुकिंगपूर्वी व्हॉट्सअॅपवर किंमत निश्चित केली जाते.",
      availEyebrow: "उपलब्धता", availH2: "मेसेज पाठवण्यापूर्वी आजच्या गाड्या पाहा",
      availP: "आमच्या बुकिंग शीटमधून थेट स्थिती — प्रत्यक्षात काय मोकळे आहे हे पाहण्यासाठी एक तारीख निवडा.",
      bookEyebrow: "प्रवास बुक करा", bookH2: "आमच्या कोणत्याही ठरलेल्या मार्गावर, किंवा तुमच्या आवडीने",
      bookP: "वर एक मार्ग निवडा, किंवा इथे निवडा. हे भरा आणि सर्व माहिती आधीच भरलेले व्हॉट्सअॅप उघडेल — फक्त पाठवा दाबा. बोलणे पसंत आहे? इथूनच थेट कॉल करा.",
      toggleFixed: "ठरलेला मार्ग", toggleCustom: "स्वतःचे ठिकाण",
      labelRoute: "तुमचा मार्ग निवडा", labelPickup: "पिकअप ठिकाण", labelDrop: "ड्रॉप ठिकाण",
      labelDate: "पिकअप तारीख", labelTime: "पिकअप वेळ", labelTripType: "प्रवासाचा प्रकार",
      tripOneWay: "एकेरी", tripRound: "राउंड ट्रिप", labelPassengers: "प्रवासी",
      labelPhone: "तुमचा फोन नंबर", labelName: "तुमचे नाव",
      btnSend: "व्हॉट्सअॅपवर बुकिंग पाठवा", btnCallInstead: "किंवा कॉल करा",
      confirmMsg: "तुमची माहिती भरून व्हॉट्सअॅप उघडत आहे — फक्त पाठवा दाबा.",
      formNote: "काहीही निश्चित होण्यापूर्वी आम्ही ठरलेल्या किमतीसह उत्तर देऊ. किंमत जाणून घेण्यासाठी आगाऊ पैसे देण्याची गरज नाही.",
      destH3: "दुसरीकडे जायचे आहे? एक लोकप्रिय ठिकाण निवडा:", whyH3: "आमच्याकडून थेट बुकिंग का करावी",
      why1: "बुकिंगपूर्वी व्हॉट्सअॅपवर भाडे निश्चित — सर्ज नाही, ड्रॉपच्या वेळी आश्चर्य नाही.",
      why2: "तोच ड्रायव्हर, तीच गाडी, मालकाकडून चालवले जाते — कॉल-सेंटर डिस्पॅच नाही.",
      why3: "नाशिक, मुंबई किंवा पुण्यात घरपोच पिकअप, भारतात कुठेही ड्रॉप.",
      why4: "एकेरी किंवा राउंड ट्रिप, तुमची निवड — जे बुक कराल त्याचेच पैसे द्या.",
      fleetEyebrow: "आमच्या गाड्या", fleetH2: "आठ गाड्या, प्रत्येक प्रवासासाठी एक",
      fleetP: "एका छोट्या एकट्याच्या फेरीपासून ते संपूर्ण कुटुंबाच्या आउटस्टेशन ट्रिपपर्यंत — बुकिंग करताना जे योग्य वाटेल ते निवडा, किंवा आमच्यावर सोडा.",
      trustEyebrow: "सुरक्षा", trustH2: "प्रत्येक प्रवासात आमचे वचन",
      trustP: "ही धोरणात्मक वचनबद्धता आहेत — तुमची प्रत्यक्ष पद्धत वेगळी असल्यास खालील कोणतीही ओळ संपादित करा.",
      trust1h: "परवानाधारक ड्रायव्हर", trust1p: "प्रत्येक ड्रायव्हरकडे वैध व्यावसायिक वाहन परवाना आहे.",
      trust2h: "देखभाल केलेल्या गाड्या", trust2p: "नियमित सर्व्हिसिंग — अचानक खराब स्थितीत येणारी गाडी नाही.",
      trust3h: "तोच ड्रायव्हर, तीच गाडी", trust3p: "रस्त्यात अचानक दुसऱ्या गाडीत बदल होणार नाही.",
      trust4h: "थेट संपर्क", trust4p: "तुम्ही थेट मालकाशी संपर्क साधता — कॉल-सेंटरची रांग नाही.",
      faqEyebrow: "सामान्य प्रश्न", faqH2: "सामान्य प्रश्न",
      faqP: "खाली सामान्य उत्तरे दिली आहेत — तुमच्या प्रत्यक्ष धोरणानुसार तपशील (नेमका सवलत कालावधी, नेमके शुल्क) संपादित करा.",
      faqQ1: "मी किती सामान आणू शकतो?",
      faqA1: "प्रत्येक प्रवाशासाठी एक किंवा दोन सर्वसाधारण बॅग कोणत्याही गाडीत चालतील. जास्त मोठ्या सामानासाठी, बुकिंग करताना सांगा म्हणजे आम्ही योग्य गाडी देऊ.",
      faqQ2: "वाट पाहण्याच्या वेळेसाठी शुल्क आकारले जाते का?",
      faqA2: "थोडा सवलत कालावधी मोफत समाविष्ट आहे. त्यानंतर वाट पाहण्याचे शुल्क लागू शकते — बुकिंग करताना नेमके धोरण विचारून घ्या.",
      faqQ3: "मी रात्री किंवा पहाटे लवकर पिकअप बुक करू शकतो का?",
      faqA3: "हो — फक्त व्हॉट्सअॅपवर बुकिंग करताना वेळ सांगा म्हणजे आम्ही त्या वेळेसाठी गाडी उपलब्ध असल्याची खात्री करू.",
      faqQ4: "मला रद्द करायचे असेल तर?",
      faqA4: "शक्य तितक्या लवकर व्हॉट्सअॅपवर कळवा. पिकअप वेळेच्या खूप आधी रद्द करणे सहसा काही अडचण नसते — अगदी शेवटच्या क्षणी रद्द करणे प्रकरणानुसार हाताळले जाऊ शकते.",
      faqQ5: "मी पैसे कसे द्यावेत?",
      faqA5: "आम्ही प्रवासापूर्वी व्हॉट्सअॅपवर भाडे निश्चित करतो. पैसे सहसा थेट घेतले जातात — बुकिंग करताना तुमच्या आवडत्या पद्धतीबद्दल (रोख/यूपीआय) विचारा.",
      faqQ6: "प्रवासादरम्यान भाडे बदलू शकते का?",
      faqA6: "नाही — बुकिंगपूर्वी व्हॉट्सअॅपवर ठरलेले भाडेच तुम्ही द्यावे, जोपर्यंत मार्ग किंवा थांबे ठरल्यापेक्षा वेगळे होत नाहीत.",
      footerTagline: "नाशिकमध्ये आधारित मालक-चालित टॅक्सी सेवा. दररोज नाशिक–पुणे, तसेच तुम्हाला हवे तिथे कस्टम प्रवास."
    }
  };

  function setLang(lang){
    const dict = I18N[lang] || I18N.en;
    document.querySelectorAll('[data-i18n]').forEach(el=>{
      const key = el.getAttribute('data-i18n');
      if(dict[key]) el.textContent = dict[key];
    });
    document.querySelectorAll('.lang-toggle button').forEach(b=> b.classList.remove('active'));
    const btnId = { en:'langEnBtn', hi:'langHiBtn', mr:'langMrBtn' }[lang];
    const btn = document.getElementById(btnId);
    if(btn) btn.classList.add('active');
    try{ localStorage.setItem('cabsway_lang', lang); }catch(e){}
  }
  (function initLang(){
    let saved = 'en';
    try{ saved = localStorage.getItem('cabsway_lang') || 'en'; }catch(e){}
    setLang(saved);
  })();
  // =====================================================================

  document.getElementById('year').textContent = new Date().getFullYear();
  [ 'headerCallBtn','formCallBtn' ].forEach(id=>{
    const el = document.getElementById(id);
    if(el) el.setAttribute('href', 'tel:' + OWNER_PHONE);
  });
  document.querySelectorAll('footer a[href^="tel:"]').forEach(el=> el.setAttribute('href','tel:'+OWNER_PHONE));
  document.querySelectorAll('footer a[href*="wa.me"]').forEach(el=> el.setAttribute('href','https://wa.me/'+OWNER_WHATSAPP));
  const floatWa = document.getElementById('floatWhatsapp');
  if(floatWa) floatWa.setAttribute('href', 'https://wa.me/' + OWNER_WHATSAPP);

  function toggleFaq(btn){
    const item = btn.closest('.faq-item');
    const wasOpen = item.classList.contains('open');
    document.querySelectorAll('.faq-item.open').forEach(el => el.classList.remove('open'));
    if(!wasOpen) item.classList.add('open');
  }

  const ROUTES = {
    'nashik-pune':   { pickup:'Nashik', drop:'Pune',                        km:'~210 km', hrs:'~4.5 hrs' },
    'pune-nashik':   { pickup:'Pune',   drop:'Nashik',                      km:'~210 km', hrs:'~4.5 hrs' },
    'nashik-mumbai': { pickup:'Nashik', drop:'Mumbai',                      km:'~170 km', hrs:'~3.5 hrs' },
    'mumbai-nashik': { pickup:'Mumbai', drop:'Nashik',                      km:'~170 km', hrs:'~3.5 hrs' },
    'mumbai-pune':   { pickup:'Mumbai', drop:'Pune',                        km:'~150 km', hrs:'~3 hrs'   },
    'pune-mumbai':   { pickup:'Pune',   drop:'Mumbai',                      km:'~150 km', hrs:'~3 hrs'   },
    'nashik-csn':    { pickup:'Nashik', drop:'Chhatrapati Sambhaji Nagar',  km:'~180 km', hrs:'~3.5 hrs' },
    'csn-nashik':    { pickup:'Chhatrapati Sambhaji Nagar', drop:'Nashik',  km:'~180 km', hrs:'~3.5 hrs' }
  };

  let mode = 'fixed';
  const pickupInput = document.getElementById('pickup');
  const dropInput = document.getElementById('drop');
  const routeSelect = document.getElementById('routeSelect');
  const routeSelectField = document.getElementById('routeSelectField');
  const routeStartCity = document.getElementById('routeStartCity');
  const routeStartKm = document.getElementById('routeStartKm');
  const routeEndCity = document.getElementById('routeEndCity');
  const routeEndKm = document.getElementById('routeEndKm');
  const routeVisual = document.getElementById('routeVisual');
  const modeFixedBtn = document.getElementById('modeFixedBtn');
  const modeCustomBtn = document.getElementById('modeCustomBtn');
  const statDistance = document.getElementById('statDistance');
  const statDuration = document.getElementById('statDuration');
  const statDistanceLabel = document.getElementById('statDistanceLabel');

  function applyRoute(key){
    const r = ROUTES[key];
    if(!r) return;
    routeSelect.value = key;
    pickupInput.value = r.pickup;
    dropInput.value = r.drop;
    routeStartCity.textContent = r.pickup;
    routeStartKm.textContent = '0 KM';
    routeEndCity.textContent = r.drop;
    routeEndKm.textContent = r.km.toUpperCase();
    statDistance.textContent = r.km;
    statDuration.textContent = r.hrs;
    statDistanceLabel.textContent = 'route distance';
  }

  function selectRoute(key){
    setMode('fixed');
    applyRoute(key);
    document.getElementById('book').scrollIntoView({behavior:'smooth'});
  }

  function goCustom(){
    setMode('custom');
    document.getElementById('book').scrollIntoView({behavior:'smooth'});
  }

  function setMode(newMode){
    mode = newMode;
    if(mode === 'fixed'){
      modeFixedBtn.classList.add('active');
      modeCustomBtn.classList.remove('active');
      routeSelectField.style.display = '';
      pickupInput.readOnly = true;
      dropInput.readOnly = true;
      routeVisual.classList.remove('mode-custom');
      applyRoute(routeSelect.value);
    } else {
      modeCustomBtn.classList.add('active');
      modeFixedBtn.classList.remove('active');
      routeSelectField.style.display = 'none';
      pickupInput.readOnly = false;
      dropInput.readOnly = false;
      dropInput.value = '';
      dropInput.focus();
      routeStartCity.textContent = pickupInput.value || 'Nashik';
      routeStartKm.textContent = '0 KM';
      routeEndCity.textContent = '?';
      routeEndKm.textContent = 'YOUR PICK';
      statDistance.textContent = '—';
      statDuration.textContent = '—';
      statDistanceLabel.textContent = 'you choose';
      routeVisual.classList.add('mode-custom');
    }
  }

  function pickDestination(place){
    setMode('custom');
    dropInput.value = place;
    routeEndCity.textContent = place;
    routeEndKm.textContent = '';
    document.getElementById('book').scrollIntoView({behavior:'smooth'});
  }

  setMode('fixed');
  document.getElementById('heroCustomLink').addEventListener('click', ()=> setMode('custom'));

  document.querySelectorAll('#tripTypeRow input').forEach(radio=>{
    radio.addEventListener('change', ()=>{
      document.querySelectorAll('#tripTypeRow .radio-chip').forEach(c=>c.classList.remove('checked'));
      radio.closest('.radio-chip').classList.add('checked');
    });
  });

  document.getElementById('bookingForm').addEventListener('submit', function(e){
    e.preventDefault();
    const pickup = document.getElementById('pickup').value.trim();
    const drop = document.getElementById('drop').value.trim();
    const date = document.getElementById('date').value;
    const time = document.getElementById('time').value;
    const tripType = document.querySelector('#tripTypeRow input:checked').value;
    const passengers = document.getElementById('passengers').value;
    const phone = document.getElementById('phone').value.trim();
    const name = document.getElementById('name').value.trim();

    const lines = [
      `Hi, I'd like to book a taxi.`,
      `Name: ${name}`,
      `Route: ${pickup} → ${drop} (${mode === 'fixed' ? 'fixed route' : 'custom destination'})`,
      `Trip type: ${tripType}`,
      `Date: ${date}  Time: ${time}`,
      `Passengers: ${passengers}`,
      `My phone: ${phone}`
    ];
    const message = encodeURIComponent(lines.join('\n'));
    const url = `https://wa.me/${OWNER_WHATSAPP}?text=${message}`;
    window.open(url, '_blank');

    const confirmEl = document.getElementById('confirmMsg');
    confirmEl.classList.add('show');
  });

  // ================= LIVE AVAILABILITY =================
  // Paste the SAME Apps Script URL you used in admin.html here.
  const SHEET_API_URL = "https://script.google.com/macros/s/AKfycbzSQCwytw93-CFNTWbsgh3QDW7paXy09ilKy6NZyThDkMYHsxj7etWeU95wCn7iFu1TiQ/exec";
  const FLEET_CARS = ["Swift","Ciaz","Aura","Ertiga","XL6","Innova","Innova Crysta","Kia Carens"];
  const liveEl = document.getElementById('liveAvailability');
  const dateInput = document.getElementById('date');

  // Loads data via a <script> tag instead of fetch() — this avoids the CORS
  // block Google Apps Script triggers when called from a real website with
  // fetch. Visiting the URL directly in a browser still behaves the same.
  function jsonpRequest(url){
    return new Promise((resolve, reject)=>{
      const cbName = 'jsonp_cb_' + Math.random().toString(36).slice(2);
      const script = document.createElement('script');
      const cleanup = ()=>{ delete window[cbName]; script.remove(); };
      window[cbName] = (data)=>{ cleanup(); resolve(data); };
      script.onerror = ()=>{ cleanup(); reject(new Error('Request failed to load')); };
      const sep = url.includes('?') ? '&' : '?';
      script.src = url + sep + 'callback=' + cbName;
      document.body.appendChild(script);
      setTimeout(()=>{ if(window[cbName]){ cleanup(); reject(new Error('Request timed out')); } }, 10000);
    });
  }

  async function refreshAvailability(){
    if(!dateInput.value) return;
    if(SHEET_API_URL.includes("PASTE_YOUR")){
      liveEl.textContent = '';
      return;
    }
    liveEl.textContent = 'Checking live availability…';
    try{
      const json = await jsonpRequest(SHEET_API_URL);
      if(!json.ok) throw new Error(json.error || 'unknown error');
      const bookedCars = new Set(
        json.rows.filter(r => r.date === dateInput.value && r.status === 'booked').map(r => r.car)
      );
      const freeCount = FLEET_CARS.length - bookedCars.size;
      liveEl.textContent = `🚗 ${freeCount} of ${FLEET_CARS.length} cars free on ${dateInput.value} (live)`;
    }catch(err){
      console.error('Availability check failed:', err);
      liveEl.textContent = '';
    }
  }
  dateInput.addEventListener('change', refreshAvailability);
  if(dateInput.value) refreshAvailability();

  // ---------- public availability grid (section above the booking form) ----------
  const availDate = document.getElementById('availDate');
  const availGrid = document.getElementById('availGrid');
  const availSummary = document.getElementById('availSummary');

  function todayStrPublic(){
    const d = new Date();
    return d.getFullYear() + "-" + String(d.getMonth()+1).padStart(2,"0") + "-" + String(d.getDate()).padStart(2,"0");
  }

  async function refreshAvailGrid(){
    availGrid.innerHTML = '';
    availSummary.textContent = 'Loading…';
    if(SHEET_API_URL.includes("PASTE_YOUR")){
      availSummary.textContent = 'Live availability isn\'t set up yet.';
      return;
    }
    try{
      const json = await jsonpRequest(SHEET_API_URL);
      if(!json.ok) throw new Error(json.error || 'unknown error');
      const bookedCars = new Set(
        json.rows.filter(r => r.date === availDate.value && r.status === 'booked').map(r => r.car)
      );
      let freeCount = 0;
      FLEET_CARS.forEach(car=>{
        const isBooked = bookedCars.has(car);
        if(!isBooked) freeCount++;
        const tile = document.createElement('div');
        tile.className = 'avail-tile';
        tile.innerHTML = `<div class="name">${car}</div><span class="status ${isBooked ? 'booked':'available'}">${isBooked ? 'Booked' : 'Available'}</span>`;
        availGrid.appendChild(tile);
      });
      availSummary.textContent = `${freeCount} of ${FLEET_CARS.length} cars free on ${availDate.value}`;
    }catch(err){
      console.error('Availability grid failed:', err);
      availSummary.textContent = "Couldn't load live data right now.";
    }
  }
  availDate.value = todayStrPublic();
  availDate.addEventListener('change', refreshAvailGrid);
  refreshAvailGrid();