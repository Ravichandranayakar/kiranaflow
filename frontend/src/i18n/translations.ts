import type { LangCode } from '../types/api';

export interface UIStrings {
  serviceConnected: string;
  connecting: string;
  micReady: string;
  textMode: string;
  kiranaAssistant: string;
  tapAndSpeak: string;
  tapAndSpeakSubtitle: string;
  voiceInput: string;
  listeningNow: string;
  imListening: string;
  speakNaturally: string;
  listeningSubtitle: string;
  examplePhrase: string;
  exampleUtterance: string;
  pendingEntry: string;
  liveTranscript: string;
  inProgress: string;
  listeningPrompt: string;
  speechConverting: string;
  received: string;
  damaged: string;
  netStock: string;
  confirmAndSave: string;
  edit: string;
  cancel: string;
  applyEdit: string;
  tapToSpeak: string;
  listeningTapToStop: string;
  processingEntry: string;
  finishedSpeakingHint: string;
  micStartsOnTap: string;
  orTypeInstead: string;
  hideTextInput: string;
  typePlaceholder: string;
  send: string;
  tryTestCase: string;
  speakTab: string;
  stockTab: string;
  historyTab: string;
  liveInventory: string;
  shopStockLedger: string;
  allFilter: string;
  lowFilter: string;
  damagedFilter: string;
  auditTrail: string;
  movementHistory: string;
  noDeliveriesYet: string;
  noDeliveriesSubtitle: string;
  processingEyebrow: string;
  pleaseWait: string;
  checkingYour: string;
  wordsItalic: string;
  processingSubtitle: string;
  yourSpokenInput: string;
  receivedBadge: string;
  speechCaptureComplete: string;
  checkingEntryTitle: string;
  checkingEntryShort: string;
  checkingEntrySubtitle: string;
  stepSpeechReceived: string;
  stepCheckingItems: string;
  stepPreparingNext: string;
  stepDone: string;
  stepActive: string;
  stepQueued: string;
  quickClarification: string;
  actionNeeded: string;
  letsMakeSure: string;
  oneDetailItalic: string;
  clarifySubtitle: string;
  whatIUnderstood: string;
  productLabel: string;
  unmatchedLabel: string;
  unspecifiedLabel: string;
  noneLabel: string;
  tapToAnswer: string;
  tapToAnswerHint: string;
  unknownNote: string;
  damagedPausedNote: string;
  sayProductAgain: string;
  reviewEntry: string;
  awaitingConfirmation: string;
  checkBefore: string;
  savingItalic: string;
  reviewSubtitle: string;
  pendingStockEntry: string;
  usableToAdd: string;
  usableNote: string;
  readBackLabel: string;
  confirmHintVoice: string;
  editDetails: string;
  cancelEntry: string;
  savingProgress: string;
  completedEyebrow: string;
  savedSuccessfully: string;
  entrySaved: string;
  stockRecordUpdated: string;
  completedEntry: string;
  committedBadge: string;
  usableStockAdded: string;
  recordedInLedger: string;
  savedToRecordsNote: string;
  nextEntry: string;
  nextEntryHint: string;
  openStockLedger: string;
}

export const TRANSLATIONS: Record<LangCode, UIStrings> = {
  en: {
    serviceConnected: 'Service connected',
    connecting: 'Connecting…',
    micReady: 'Microphone ready',
    textMode: 'Text mode',
    kiranaAssistant: 'KIRANA ASSISTANT',
    tapAndSpeak: 'Tap and speak.',
    tapAndSpeakSubtitle: 'Record items hands-free. Nothing saves until you confirm.',
    voiceInput: 'VOICE INPUT',
    listeningNow: 'Listening Now',
    imListening: "I'm listening.",
    speakNaturally: 'Speak naturally.',
    listeningSubtitle: 'Tell me what you need. Your words will appear below as you speak.',
    examplePhrase: 'EXAMPLE VOICE PHRASE',
    exampleUtterance: '“24 milk packets received, 2 damaged.”',
    pendingEntry: 'PENDING ENTRY',
    liveTranscript: 'LIVE TRANSCRIPT',
    inProgress: 'In Progress',
    listeningPrompt: 'Listening… speak clearly',
    speechConverting: 'Your speech is being converted to text.',
    received: 'RECEIVED',
    damaged: 'DAMAGED',
    netStock: 'NET STOCK',
    confirmAndSave: 'Confirm & Save',
    edit: 'Edit',
    cancel: 'Cancel',
    applyEdit: 'Apply Edit',
    tapToSpeak: 'TAP TO SPEAK',
    listeningTapToStop: 'LISTENING… TAP TO STOP',
    processingEntry: 'PROCESSING ENTRY…',
    finishedSpeakingHint: "Tap when you've finished speaking.",
    micStartsOnTap: 'Microphone starts only when you tap.',
    orTypeInstead: 'Or type instead.',
    hideTextInput: 'Hide text input',
    typePlaceholder: 'Type: 24 milk packets bandide 2 odada...',
    send: 'Send',
    tryTestCase: 'TRY A TEST CASE',
    speakTab: 'Speak',
    stockTab: 'Stock',
    historyTab: 'History',
    liveInventory: '02 / LIVE INVENTORY',
    shopStockLedger: 'Shop Stock Ledger',
    allFilter: 'All',
    lowFilter: 'Low',
    damagedFilter: 'Damaged',
    auditTrail: '03 / AUDIT TRAIL',
    movementHistory: 'Movement History',
    noDeliveriesYet: 'No deliveries saved yet',
    noDeliveriesSubtitle: 'Confirm an entry on the Speak screen to see the immutable PostgreSQL audit log.',
    processingEyebrow: 'PROCESSING',
    pleaseWait: 'PLEASE WAIT',
    checkingYour: 'Checking your',
    wordsItalic: 'words.',
    processingSubtitle: 'Looking at the items and quantities you mentioned.',
    yourSpokenInput: 'YOUR SPOKEN INPUT',
    receivedBadge: 'RECEIVED',
    speechCaptureComplete: 'Speech capture complete',
    checkingEntryTitle: 'Checking your entry...',
    checkingEntryShort: 'Checking...',
    checkingEntrySubtitle: 'Matching the item and verifying the quantities.',
    stepSpeechReceived: 'Speech received',
    stepCheckingItems: 'Checking item & quantities',
    stepPreparingNext: 'Preparing next step',
    stepDone: 'Done',
    stepActive: 'Active',
    stepQueued: 'Queued',
    quickClarification: 'QUICK CLARIFICATION',
    actionNeeded: 'ACTION NEEDED',
    letsMakeSure: "Let's make sure",
    oneDetailItalic: 'one detail.',
    clarifySubtitle: 'I need a little more information before I can prepare your entry.',
    whatIUnderstood: 'WHAT I UNDERSTOOD',
    productLabel: 'PRODUCT',
    unmatchedLabel: 'Unmatched',
    unspecifiedLabel: 'Select',
    noneLabel: 'None',
    tapToAnswer: 'TAP TO ANSWER',
    tapToAnswerHint: 'Tap an option above or speak your answer.',
    unknownNote: 'Does not create a new product or save stock automatically.',
    damagedPausedNote: 'Usable inventory calculation is paused. Total units will reconcile once damaged count is verified.',
    sayProductAgain: 'Say the product name again.',
    reviewEntry: 'REVIEW ENTRY',
    awaitingConfirmation: 'AWAITING CONFIRMATION',
    checkBefore: 'Check before',
    savingItalic: 'saving.',
    reviewSubtitle: 'Review the details carefully. Nothing is added to your stock until you confirm.',
    pendingStockEntry: 'PENDING STOCK ENTRY',
    usableToAdd: 'USABLE TO ADD',
    usableNote: 'Total inventory updates only after you confirm.',
    readBackLabel: 'READ-BACK',
    confirmHintVoice: 'Or say “Confirm”, “Haan”, or “Sari” to save via mic',
    editDetails: 'Edit details',
    cancelEntry: 'Cancel entry',
    savingProgress: 'SAVING…',
    completedEyebrow: 'COMPLETED',
    savedSuccessfully: 'SAVED SUCCESSFULLY',
    entrySaved: 'Entry saved.',
    stockRecordUpdated: 'Your stock record has been updated.',
    completedEntry: 'COMPLETED ENTRY',
    committedBadge: 'COMMITTED',
    usableStockAdded: 'USABLE STOCK ADDED',
    recordedInLedger: 'Contributed by this delivery • Recorded in store ledger',
    savedToRecordsNote: 'Saved to your stock records • Added to your inventory history.',
    nextEntry: 'NEXT ENTRY',
    nextEntryHint: 'Returns to voice intake for next item',
    openStockLedger: 'Open Stock Ledger',
  },
  hi: {
    serviceConnected: 'सेवा जुड़ी है',
    connecting: 'जुड़ रहा है…',
    micReady: 'माइक तैयार है',
    textMode: 'टेक्स्ट मोड',
    kiranaAssistant: 'किराना सहायक',
    tapAndSpeak: 'टैप करें और बोलें।',
    tapAndSpeakSubtitle: 'बिना हाथ लगाए सामान दर्ज करें। पुष्टि करने पर ही सुरक्षित होगा।',
    voiceInput: 'आवाज़ इनपुट',
    listeningNow: 'सुन रहे हैं',
    imListening: 'मैं सुन रहा हूँ।',
    speakNaturally: 'सहजता से बोलें।',
    listeningSubtitle: 'बोलते जाएं। आपके शब्द नीचे अपने आप दिखेंगे।',
    examplePhrase: 'उदाहरण आवाज़ वाक्य',
    exampleUtterance: '“24 दूध पैकेट मिला, 2 खराब है।”',
    pendingEntry: 'प्रलंबित प्रविष्टि',
    liveTranscript: 'लाइव ट्रांसक्रिप्ट',
    inProgress: 'चालू है',
    listeningPrompt: 'सुन रहे हैं… स्पष्ट बोलें',
    speechConverting: 'आपकी आवाज़ को टेक्स्ट में बदला जा रहा है।',
    received: 'प्राप्त',
    damaged: 'खराब',
    netStock: 'शुद्ध स्टॉक',
    confirmAndSave: 'पुष्टि करें और सहेजें',
    edit: 'संपादित करें',
    cancel: 'रद्द करें',
    applyEdit: 'लागू करें',
    tapToSpeak: 'बोलने के लिए टैप करें',
    listeningTapToStop: 'सुन रहे हैं… रोकने के लिए टैप करें',
    processingEntry: 'जांच रहे हैं…',
    finishedSpeakingHint: 'बोलना समाप्त होने पर टैप करें।',
    micStartsOnTap: 'माइक केवल आपके टैप करने पर शुरू होता है।',
    orTypeInstead: 'या टाइप करें।',
    hideTextInput: 'टेक्स्ट इनपुट छिपाएं',
    typePlaceholder: 'टाइप करें: 24 दूध पैकेट 2 खराब...',
    send: 'भेजें',
    tryTestCase: 'परीक्षण मामला आज़माएं',
    speakTab: 'बोलें',
    stockTab: 'स्टॉक',
    historyTab: 'इतिहास',
    liveInventory: '02 / लाइव इन्वेंटरी',
    shopStockLedger: 'दुकान स्टॉक बहीखाता',
    allFilter: 'सभी',
    lowFilter: 'कम स्टॉक',
    damagedFilter: 'खराब',
    auditTrail: '03 / ऑडिट ट्रेल',
    movementHistory: 'आवाजाही इतिहास',
    noDeliveriesYet: 'अभी कोई डिलीवरी सहेजी नहीं गई',
    noDeliveriesSubtitle: 'पोस्टग्रेएसक्यूएल रिकॉर्ड देखने के लिए स्पीक स्क्रीन पर पुष्टि करें।',
    processingEyebrow: 'जांच जारी है',
    pleaseWait: 'कृपया प्रतीक्षा करें',
    checkingYour: 'आपके शब्दों की',
    wordsItalic: 'जांच हो रही है।',
    processingSubtitle: 'बताए गए सामान और मात्रा का मिलान किया जा रहा है।',
    yourSpokenInput: 'आपका बोला गया वाक्य',
    receivedBadge: 'प्राप्त हुआ',
    speechCaptureComplete: 'आवाज़ कैप्चर पूरी हुई',
    checkingEntryTitle: 'प्रविष्टि की जांच हो रही है...',
    checkingEntryShort: 'जांच हो रही है...',
    checkingEntrySubtitle: 'सामान और मात्रा का सत्यापन किया जा रहा है।',
    stepSpeechReceived: 'आवाज़ प्राप्त हुई',
    stepCheckingItems: 'सामान और मात्रा की जांच',
    stepPreparingNext: 'अगला चरण तैयार हो रहा है',
    stepDone: 'पूर्ण',
    stepActive: 'सक्रिय',
    stepQueued: 'कतार में',
    quickClarification: 'त्वरित स्पष्टीकरण',
    actionNeeded: 'जानकारी आवश्यक',
    letsMakeSure: 'आइए पक्का करें',
    oneDetailItalic: 'एक विवरण।',
    clarifySubtitle: 'प्रविष्टि तैयार करने से पहले मुझे थोड़ी और जानकारी चाहिए।',
    whatIUnderstood: 'जो मैंने समझा',
    productLabel: 'उत्पाद',
    unmatchedLabel: 'अज्ञात',
    unspecifiedLabel: 'चुनें',
    noneLabel: 'कोई नहीं',
    tapToAnswer: 'उत्तर देने के लिए टैप करें',
    tapToAnswerHint: 'ऊपर विकल्प चुनें या बोलकर उत्तर दें।',
    unknownNote: 'यह अपने आप नया उत्पाद नहीं बनाता और स्टॉक सहेजता नहीं है।',
    damagedPausedNote: 'उपयोग योग्य स्टॉक की गणना रुकी हुई है। खराब गिनती सत्यापित होने पर कुल स्टॉक अपडेट होगा।',
    sayProductAgain: 'कृपया उत्पाद का नाम फिर से बोलें।',
    reviewEntry: 'प्रविष्टि जांचें',
    awaitingConfirmation: 'पुष्टि की प्रतीक्षा',
    checkBefore: 'सहेजने से पहले',
    savingItalic: 'जांचें।',
    reviewSubtitle: 'विवरण ध्यान से जांचें। पुष्टि करने तक स्टॉक में कुछ नहीं जुड़ेगा।',
    pendingStockEntry: 'लंबित स्टॉक प्रविष्टि',
    usableToAdd: 'जोड़ने योग्य स्टॉक',
    usableNote: 'पुष्टि करने के बाद ही कुल स्टॉक अपडेट होगा।',
    readBackLabel: 'वॉयस पुष्टि',
    confirmHintVoice: 'माइक से सहेजने के लिए “Confirm”, “हाँ” या “सरी” बोलें',
    editDetails: 'विवरण बदलें',
    cancelEntry: 'रद्द करें',
    savingProgress: 'सहेज रहे हैं…',
    completedEyebrow: 'पूर्ण',
    savedSuccessfully: 'सफलतापूर्वक सहेजा गया',
    entrySaved: 'प्रविष्टि सहेजी गई।',
    stockRecordUpdated: 'आपका स्टॉक रिकॉर्ड अपडेट हो गया है।',
    completedEntry: 'पूर्ण प्रविष्टि',
    committedBadge: 'दर्ज हुआ',
    usableStockAdded: 'जोड़ दिया गया स्टॉक',
    recordedInLedger: 'इस डिलीवरी से जुड़ा • दुकान बहीखाते में दर्ज',
    savedToRecordsNote: 'आपके स्टॉक रिकॉर्ड में सहेजा गया • इतिहास में जोड़ा गया।',
    nextEntry: 'अगली प्रविष्टि',
    nextEntryHint: 'अगले सामान के लिए बोलने पर वापस जाएं',
    openStockLedger: 'स्टॉक बहीखाता खोलें',
  },
  kn: {
    serviceConnected: 'ಸೇವೆ ಸಂಪರ್ಕಗೊಂಡಿದೆ',
    connecting: 'ಸಂಪರ್ಕಿಸಲಾಗುತ್ತಿದೆ…',
    micReady: 'ಮೈಕ್ರೊಫೋನ್ ಸಿದ್ಧವಾಗಿದೆ',
    textMode: 'ಪಠ್ಯ ಮೋಡ್',
    kiranaAssistant: 'ಕಿರಾಣಿ ಸಹಾಯಕ',
    tapAndSpeak: 'ಟ್ಯಾಪ್ ಮಾಡಿ ಮಾತನಾಡಿ.',
    tapAndSpeakSubtitle: 'ಕೈ ಬಳಸದೆ ಸರಕು ನಮೂದಿಸಿ. ದೃಢೀಕರಿಸಿದ ನಂತರವೇ ಉಳಿಯುತ್ತದೆ.',
    voiceInput: 'ಧ್ವನಿ ಇನ್‌ಪುಟ್',
    listeningNow: 'ಕೇಳಿಸಿಕೊಳ್ಳುತ್ತಿದ್ದೇವೆ',
    imListening: 'ನಾನು ಕೇಳುತ್ತಿದ್ದೇನೆ.',
    speakNaturally: 'ಸಹಜವಾಗಿ ಮಾತನಾಡಿ.',
    listeningSubtitle: 'ನಿಮಗೆ ಬೇಕಾದುದನ್ನು ಹೇಳಿ. ನೀವು ಮಾತನಾಡುವಾಗ ಕೆಳಗೆ ಕಾಣಿಸುತ್ತದೆ.',
    examplePhrase: 'ಮಾದರಿ ಧ್ವನಿ ವಾಕ್ಯ',
    exampleUtterance: '“24 ಹಾಲು ಪ್ಯಾಕೆಟ್ ಬಂದಿದೆ, 2 ಒಡೆದಿದೆ.”',
    pendingEntry: 'ಬಾಕಿ ನಮೂದು',
    liveTranscript: 'ಲೈವ್ ಪ್ರತಿಲೇಖನ',
    inProgress: 'ಪ್ರಗತಿಯಲ್ಲಿದೆ',
    listeningPrompt: 'ಕೇಳಿಸಿಕೊಳ್ಳುತ್ತಿದ್ದೇವೆ… ಸ್ಪಷ್ಟವಾಗಿ ಮಾತನಾಡಿ',
    speechConverting: 'ನಿಮ್ಮ ಧ್ವನಿಯನ್ನು ಪಠ್ಯಕ್ಕೆ ಪರಿವರ್ತಿಸಲಾಗುತ್ತಿದೆ.',
    received: 'ಸ್ವೀಕರಿಸಿದ್ದು',
    damaged: 'ಹಾಳಾದದ್ದು',
    netStock: 'ಉಳಿದ ದಾಸ್ತಾನು',
    confirmAndSave: 'ದೃಢೀಕರಿಸಿ ಉಳಿಸಿ',
    edit: 'ತಿದ್ದುಪಡಿ',
    cancel: 'ರದ್ದುಮಾಡಿ',
    applyEdit: 'ಅನ್ವಯಿಸಿ',
    tapToSpeak: 'ಮಾತನಾಡಲು ಟ್ಯಾಪ್ ಮಾಡಿ',
    listeningTapToStop: 'ಕೇಳುತ್ತಿದ್ದೇವೆ… ನಿಲ್ಲಿಸಲು ಟ್ಯಾಪ್ ಮಾಡಿ',
    processingEntry: 'ಸಂಸ್ಕರಿಸಲಾಗುತ್ತಿದೆ…',
    finishedSpeakingHint: 'ಮಾತನಾಡಿ ಮುಗಿದ ನಂತರ ಟ್ಯಾಪ್ ಮಾಡಿ.',
    micStartsOnTap: 'ನೀವು ಟ್ಯಾಪ್ ಮಾಡಿದಾಗ ಮಾತ್ರ ಮೈಕ್ ಪ್ರಾರಂಭವಾಗುತ್ತದೆ.',
    orTypeInstead: 'ಅಥವಾ ಟೈಪ್ ಮಾಡಿ.',
    hideTextInput: 'ಪಠ್ಯ ನಮೂದನ್ನು ಮರೆಮಾಡಿ',
    typePlaceholder: 'ಟೈಪ್ ಮಾಡಿ: 24 ಹಾಲು ಪ್ಯಾಕೆಟ್ ಬಂದಿದೆ 2 ಒಡೆದಿದೆ...',
    send: 'ಕಳುಹಿಸಿ',
    tryTestCase: 'ಪರೀಕ್ಷಾರ್ಥ ಪ್ರಯೋಗ',
    speakTab: 'ಮಾತನಾಡಿ',
    stockTab: 'ದಾಸ್ತಾನು',
    historyTab: 'ಇತಿಹಾಸ',
    liveInventory: '02 / ಲೈವ್ ದಾಸ್ತಾನು',
    shopStockLedger: 'ಅಂಗಡಿ ದಾಸ್ತಾನು ಲೆಡ್ಜರ್',
    allFilter: 'ಎಲ್ಲವೂ',
    lowFilter: 'ಕಡಿಮೆ ಇರುವವು',
    damagedFilter: 'ಹಾಳಾದವು',
    auditTrail: '03 / ಆಡಿಟ್ ಟ್ರಯಲ್',
    movementHistory: 'ದಾಸ್ತಾನು ಚಲನವಲನ ಇತಿಹಾಸ',
    noDeliveriesYet: 'ಇನ್ನೂ ಯಾವುದೇ ಡೆಲಿವರಿ ದಾಖಲಾಗಿಲ್ಲ',
    noDeliveriesSubtitle: 'ರೆಕಾರ್ಡ್ ನೋಡಲು ಸ್ಪೀಕ್ ಪರದೆಯಲ್ಲಿ ನಮೂದನ್ನು ದೃಢೀಕರಿಸಿ.',
    processingEyebrow: 'ಪರಿಶೀಲಿಸಲಾಗುತ್ತಿದೆ',
    pleaseWait: 'ದಯವಿಟ್ಟು ಕಾಯಿರಿ',
    checkingYour: 'ನಿಮ್ಮ ಮಾತುಗಳನ್ನು',
    wordsItalic: 'ಪರಿಶೀಲಿಸುತ್ತಿದೆ.',
    processingSubtitle: 'ನೀವು ಹೇಳಿದ ವಸ್ತು ಮತ್ತು ಪ್ರಮಾಣವನ್ನು ಹೊಂದಿಸಲಾಗುತ್ತಿದೆ.',
    yourSpokenInput: 'ನಿಮ್ಮ ಧ್ವನಿ ಇನ್‌ಪುಟ್',
    receivedBadge: 'ಸ್ವೀಕರಿಸಲಾಗಿದೆ',
    speechCaptureComplete: 'ಧ್ವನಿ ದಾಖಲಾತಿ ಪೂರ್ಣಗೊಂಡಿದೆ',
    checkingEntryTitle: 'ನಮೂದನ್ನು ಪರಿಶೀಲಿಸಲಾಗುತ್ತಿದೆ...',
    checkingEntryShort: 'ಪರಿಶೀಲಿಸುತ್ತಿದೆ...',
    checkingEntrySubtitle: 'ವಸ್ತು ಮತ್ತು ಪ್ರಮಾಣವನ್ನು ದೃಢಪಡಿಸಲಾಗುತ್ತಿದೆ.',
    stepSpeechReceived: 'ಧ್ವನಿ ಸ್ವೀಕರಿಸಲಾಗಿದೆ',
    stepCheckingItems: 'ವಸ್ತು ಮತ್ತು ಪ್ರಮಾಣ ಪರಿಶೀಲನೆ',
    stepPreparingNext: 'ಮುಂದಿನ ಹಂತ ಸಿದ್ಧವಾಗುತ್ತಿದೆ',
    stepDone: 'ಮುಗಿದಿದೆ',
    stepActive: 'ಸಕ್ರಿಯ',
    stepQueued: 'ಸರದಿಯಲ್ಲಿ',
    quickClarification: 'ತ್ವರಿತ ಸ್ಪಷ್ಟೀಕರಣ',
    actionNeeded: 'ಮಾಹಿತಿ ಅಗತ್ಯವಿದೆ',
    letsMakeSure: 'ಖಚಿತಪಡಿಸಿಕೊಳ್ಳೋಣ',
    oneDetailItalic: 'ಒಂದು ವಿವರ.',
    clarifySubtitle: 'ನಮೂದನ್ನು ಸಿದ್ಧಪಡಿಸುವ ಮೊದಲು ನನಗೆ ಸ್ವಲ್ಪ ಹೆಚ್ಚಿನ ಮಾಹಿತಿ ಬೇಕು.',
    whatIUnderstood: 'ನಾನು ಅರ್ಥಮಾಡಿಕೊಂಡದ್ದು',
    productLabel: 'ವಸ್ತು',
    unmatchedLabel: 'ಹೊಂದಾಣಿಕೆಯಾಗಿಲ್ಲ',
    unspecifiedLabel: 'ಆಯ್ಕೆಮಾಡಿ',
    noneLabel: 'ಯಾವುದೂ ಇಲ್ಲ',
    tapToAnswer: 'ಉತ್ತರಿಸಲು ಟ್ಯಾಪ್ ಮಾಡಿ',
    tapToAnswerHint: 'ಮೇಲಿನ ಆಯ್ಕೆಯನ್ನು ಟ್ಯಾಪ್ ಮಾಡಿ ಅಥವಾ ಮಾತನಾಡಿ.',
    unknownNote: 'ಇದು ಸ್ವಯಂಚಾಲಿತವಾಗಿ ಹೊಸ ವಸ್ತುವನ್ನು ರಚಿಸುವುದಿಲ್ಲ ಅಥವಾ ದಾಸ್ತಾನು ಉಳಿಸುವುದಿಲ್ಲ.',
    damagedPausedNote: 'ಬಳಸಬಹುದಾದ ದಾಸ್ತಾನು ಲೆಕ್ಕಾಚಾರವನ್ನು ನಿಲ್ಲಿಸಲಾಗಿದೆ. ಹಾಳಾದ ಸಂಖ್ಯೆ ದೃಢೀಕರಿಸಿದ ನಂತರ ನವೀಕರಿಸಲಾಗುತ್ತದೆ.',
    sayProductAgain: 'ದಯವಿಟ್ಟು ವಸ್ತುವಿನ ಹೆಸರನ್ನು ಮತ್ತೊಮ್ಮೆ ಹೇಳಿ.',
    reviewEntry: 'ನಮೂದು ಪರಿಶೀಲನೆ',
    awaitingConfirmation: 'ದೃಢೀಕರಣಕ್ಕಾಗಿ ಕಾಯುತ್ತಿದೆ',
    checkBefore: 'ಉಳಿಸುವ ಮೊದಲು',
    savingItalic: 'ಪರಿಶೀಲಿಸಿ.',
    reviewSubtitle: 'ವಿವರಗಳನ್ನು ಎಚ್ಚರಿಕೆಯಿಂದ ಪರಿಶೀಲಿಸಿ. ನೀವು ದೃಢೀಕರಿಸುವವರೆಗೆ ದಾಸ್ತಾನಿಗೆ ಏನೂ ಸೇರಲ್ಲ.',
    pendingStockEntry: 'ಬಾಕಿ ದಾಸ್ತಾನು ನಮೂದು',
    usableToAdd: 'ಸೇರಿಸಬಹುದಾದ ದಾಸ್ತಾನು',
    usableNote: 'ನೀವು ದೃಢೀಕರಿಸಿದ ನಂತರವೇ ಒಟ್ಟು ದಾಸ್ತಾನು ಅಪ್‌ಡೇಟ್ ಆಗುತ್ತದೆ.',
    readBackLabel: 'ಧ್ವನಿ ಪರಿಶೀಲನೆ',
    confirmHintVoice: 'ಮೈಕ್ ಮೂಲಕ ಉಳಿಸಲು “Confirm”, “ಹೌದು” ಅಥವಾ “ಸರಿ” ಹೇಳಿ',
    editDetails: 'ವಿವರ ತಿದ್ದುಪಡಿ',
    cancelEntry: 'ರದ್ದುಮಾಡಿ',
    savingProgress: 'ಉಳಿಸಲಾಗುತ್ತಿದೆ…',
    completedEyebrow: 'ಪೂರ್ಣಗೊಂಡಿದೆ',
    savedSuccessfully: 'ಯಶಸ್ವಿಯಾಗಿ ಉಳಿಸಲಾಗಿದೆ',
    entrySaved: 'ನಮೂದು ಉಳಿಸಲಾಗಿದೆ.',
    stockRecordUpdated: 'ನಿಮ್ಮ ದಾಸ್ತಾನು ದಾಖಲೆ ನವೀಕರಿಸಲಾಗಿದೆ.',
    completedEntry: 'ಪೂರ್ಣಗೊಂಡ ನಮೂದು',
    committedBadge: 'ದಾಖಲಾಗಿದೆ',
    usableStockAdded: 'ಸೇರಿಸಲಾದ ದಾಸ್ತಾನು',
    recordedInLedger: 'ಈ ವಿತರಣೆಯಿಂದ ಸೇರಿದೆ • ಅಂಗಡಿ ಲೆಡ್ಜರ್‌ನಲ್ಲಿ ದಾಖಲಾಗಿದೆ',
    savedToRecordsNote: 'ನಿಮ್ಮ ದಾಸ್ತಾನು ದಾಖಲೆಗೆ ಉಳಿಸಲಾಗಿದೆ • ಇತಿಹಾಸಕ್ಕೆ ಸೇರಿಸಲಾಗಿದೆ.',
    nextEntry: 'ಮುಂದಿನ ನಮೂದು',
    nextEntryHint: 'ಮುಂದಿನ ವಸ್ತುವಿಗಾಗಿ ಧ್ವನಿ ಪರದೆಗೆ ಹಿಂತಿರುಗಿ',
    openStockLedger: 'ದಾಸ್ತಾನು ಲೆಡ್ಜರ್ ತೆರೆಯಿರಿ',
  },
};
