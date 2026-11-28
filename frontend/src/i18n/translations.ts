import type { LangCode, ParseResponse, PendingDraft, PendingEntry } from '../types/api';

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
  draftReorder: string;
  reorderCopied: string;
  badgeClarify: string;
  badgeCorrected: string;
  badgeVerifySave: string;
  badgeSaved: string;
  badgeReview: string;
  batchBadge: string;
  deliveryItemsSuffix: string;
  totalUnitsLabel: string;
  receivedWord: string;
  damagedWord: string;
  skusCountSuffix: string;
  addItemBtn: string;
  closeBtn: string;
  addProductTitle: string;
  addProductNamePlaceholder: string;
  addProductAliasPlaceholder: string;
  startingStockLabel: string;
  lowAlertLabel: string;
  addingBtn: string;
  saveToCatalogueBtn: string;
  noFilterMatches: string;
  usableLabel: string;
  returnLabel: string;
  reasonPlaceholder: string;
  savingShortBtn: string;
  updateBtn: string;
  cannotGoNegative: string;
  removeSkuConfirm: string;
  keepBtn: string;
  confirmDeleteBtn: string;
  removeSkuLink: string;
  entriesSuffix: string;
  usableDeltaWord: string;
  dmgShortWord: string;
  settingsTitle: string;
  storeProfileTitle: string;
  storeProfileUnset: string;
  shopNameLabel: string;
  shopNamePlaceholder: string;
  ownerNameLabel: string;
  ownerNamePlaceholder: string;
  locationNoteLabel: string;
  locationNotePlaceholder: string;
  saveProfileBtn: string;
  profileSavedNote: string;
  voicePrefsTitle: string;
  preferredLangLabel: string;
  spokenReadbackTitle: string;
  ttsSubtitle: string;
  mutedBtn: string;
  activeBtn: string;
  autoFollowUpTitle: string;
  autoFollowUpSubtitle: string;
  onBtn: string;
  offBtn: string;
  engineReadyTitle: string;
  engineReadyDesc: string;
  engineConnectingDesc: string;
  noOsVoiceNote: string;
  selectBothAllPrefix: string;
  itemsWord: string;
  receivedPausedNote: string;
  queuedLabel: string;
  speakConfirmOrEditBtn: string;
  listeningReplyStopBtn: string;
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
    confirmHintVoice: 'Say “OK”, “Ya”, “Confirm”, “Haan”, “Sari” — or say edits (e.g. “3 damaged”)',
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
    draftReorder: 'Copy WhatsApp Reorder Draft',
    reorderCopied: 'Reorder draft copied!',
    badgeClarify: 'CLARIFY',
    badgeCorrected: 'CORRECTED',
    badgeVerifySave: 'VERIFY & SAVE',
    badgeSaved: 'SAVED',
    badgeReview: 'REVIEW',
    batchBadge: 'BATCH',
    deliveryItemsSuffix: 'Delivery Items',
    totalUnitsLabel: 'total units',
    receivedWord: 'received',
    damagedWord: 'damaged',
    skusCountSuffix: 'SKUs',
    addItemBtn: 'Add Item',
    closeBtn: 'Close',
    addProductTitle: 'Add New Product to Catalogue',
    addProductNamePlaceholder: 'Product name (e.g. Amul Butter 100g)',
    addProductAliasPlaceholder: 'Spoken aliases, comma-separated (e.g. amul butter, butter, makkhan)',
    startingStockLabel: 'Starting Stock',
    lowAlertLabel: 'Low Alert (<)',
    addingBtn: 'Adding…',
    saveToCatalogueBtn: 'Save to Store Catalogue',
    noFilterMatches: 'No items match this filter.',
    usableLabel: 'Usable',
    returnLabel: 'Return',
    reasonPlaceholder: 'Reason (e.g. Sold, Opening stock, Returned)',
    savingShortBtn: 'Saving…',
    updateBtn: 'Update',
    cannotGoNegative: 'Cannot reduce stock below 0.',
    removeSkuConfirm: 'Remove SKU & history?',
    keepBtn: 'Keep',
    confirmDeleteBtn: 'Confirm Delete',
    removeSkuLink: 'Remove SKU from catalogue',
    entriesSuffix: 'Entries',
    usableDeltaWord: 'usable',
    dmgShortWord: 'dmg',
    settingsTitle: 'Store Profile & Settings',
    storeProfileTitle: 'Store Profile',
    storeProfileUnset: 'Add your shop name for supplier reorders',
    shopNameLabel: 'Shop Name',
    shopNamePlaceholder: 'e.g. Sri Lakshmi Kirana Store',
    ownerNameLabel: 'Owner Name',
    ownerNamePlaceholder: 'e.g. Ramesh / Ravi',
    locationNoteLabel: 'Area / City',
    locationNotePlaceholder: 'e.g. Indiranagar • Ph: 98xxx',
    saveProfileBtn: 'Save Profile',
    profileSavedNote: 'Saved',
    voicePrefsTitle: 'Voice & Language Preferences',
    preferredLangLabel: 'App & Voice Language',
    spokenReadbackTitle: 'Spoken Read-Back',
    ttsSubtitle: 'Speaks confirmations & questions aloud',
    mutedBtn: 'Muted',
    activeBtn: 'Active',
    autoFollowUpTitle: 'Auto Follow-Up Mic',
    autoFollowUpSubtitle: 'Opens mic automatically after read-back for “OK / Confirm”',
    onBtn: 'On',
    offBtn: 'Off',
    engineReadyTitle: 'Offline Voice Engine Active',
    engineReadyDesc: 'Local Whisper STT • PostgreSQL Ledger • Zero API Key Required',
    engineConnectingDesc: 'Connecting to local Whisper & PostgreSQL service…',
    noOsVoiceNote: 'No native regional voice pack in this browser — using phonetic voice fallback while keeping screen text in your language.',
    selectBothAllPrefix: 'Select All / Both',
    itemsWord: 'items',
    receivedPausedNote: 'Tap a quick quantity above, or speak/type the exact received count.',
    queuedLabel: 'Queued',
    speakConfirmOrEditBtn: 'Speak “OK / Confirm” or Edit',
    listeningReplyStopBtn: 'Listening for “OK / Confirm” or edit… Tap to stop',
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
    confirmHintVoice: 'माइक से सहेजने के लिए “OK”, “Confirm”, “हाँ” बोलें — या बदलाव बोलें (उदा. “3 खराब”)',
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
    draftReorder: 'व्हाट्सएप रीऑर्डर ड्राफ्ट कॉपी करें',
    reorderCopied: 'रीऑर्डर ड्राफ्ट कॉपी हो गया!',
    badgeClarify: 'स्पष्ट करें',
    badgeCorrected: 'संशोधित',
    badgeVerifySave: 'जांचें और सहेजें',
    badgeSaved: 'सहेजा गया',
    badgeReview: 'समीक्षा',
    batchBadge: 'बैच',
    deliveryItemsSuffix: 'डिलीवरी आइटम',
    totalUnitsLabel: 'कुल इकाइयाँ',
    receivedWord: 'प्राप्त',
    damagedWord: 'खराब',
    skusCountSuffix: 'सामान',
    addItemBtn: 'सामान जोड़ें',
    closeBtn: 'बंद करें',
    addProductTitle: 'कैटलॉग में नया सामान जोड़ें',
    addProductNamePlaceholder: 'सामान का नाम (उदा. Amul Butter 100g)',
    addProductAliasPlaceholder: 'बोलचाल के नाम, कॉमा से अलग (उदा. amul butter, makkhan)',
    startingStockLabel: 'शुरुआती स्टॉक',
    lowAlertLabel: 'कम स्टॉक सीमा (<)',
    addingBtn: 'जोड़ रहे हैं…',
    saveToCatalogueBtn: 'कैटलॉग में सहेजें',
    noFilterMatches: 'इस फ़िल्टर से कोई सामान मेल नहीं खाता।',
    usableLabel: 'उपयोग योग्य',
    returnLabel: 'वापसी',
    reasonPlaceholder: 'कारण (उदा. बिक्री, शुरुआती स्टॉक, वापसी)',
    savingShortBtn: 'सहेज रहे हैं…',
    updateBtn: 'अपडेट करें',
    cannotGoNegative: 'स्टॉक 0 से कम नहीं कर सकते।',
    removeSkuConfirm: 'सामान और इतिहास हटाएं?',
    keepBtn: 'रखें',
    confirmDeleteBtn: 'हटाना पक्का करें',
    removeSkuLink: 'कैटलॉग से हटाएं',
    entriesSuffix: 'प्रविष्टियाँ',
    usableDeltaWord: 'उपयोगी',
    dmgShortWord: 'खराब',
    settingsTitle: 'दुकान प्रोफ़ाइल और सेटिंग्स',
    storeProfileTitle: 'दुकान की प्रोफ़ाइल',
    storeProfileUnset: 'रीऑर्डर संदेश के लिए दुकान का नाम जोड़ें',
    shopNameLabel: 'दुकान का नाम',
    shopNamePlaceholder: 'उदा. श्री लक्ष्मी किराना स्टोर',
    ownerNameLabel: 'मालिक का नाम',
    ownerNamePlaceholder: 'उदा. रमेश / रवि',
    locationNoteLabel: 'पता / शहर',
    locationNotePlaceholder: 'उदा. इंदिरानगर • मोबाइल',
    saveProfileBtn: 'प्रोफ़ाइल सहेजें',
    profileSavedNote: 'सहेजा गया',
    voicePrefsTitle: 'आवाज़ और भाषा सेटिंग्स',
    preferredLangLabel: 'ऐप और आवाज़ भाषा',
    spokenReadbackTitle: 'बोलकर पुष्टि',
    ttsSubtitle: 'पुष्टि और प्रश्न ज़ोर से सुनाता है',
    mutedBtn: 'म्यूट',
    activeBtn: 'चालू',
    autoFollowUpTitle: 'ऑटो फ़ॉलो-अप माइक',
    autoFollowUpSubtitle: 'बोलकर पुष्टि के बाद “हाँ / OK” सुनने के लिए माइक अपने आप खोलता है',
    onBtn: 'चालू',
    offBtn: 'बंद',
    engineReadyTitle: 'ऑफ़लाइन वॉयस इंजन चालू है',
    engineReadyDesc: 'लोकल Whisper STT • PostgreSQL बहीखाता • कोई API कुंजी आवश्यक नहीं',
    engineConnectingDesc: 'लोकल Whisper और PostgreSQL सेवा से जुड़ रहा है…',
    noOsVoiceNote: 'ब्राउज़र में हिन्दी आवाज़ पैक न होने पर हिंग्लिश उच्चारण आवाज़ चल रही है — स्क्रीन पर पाठ हिन्दी में है।',
    selectBothAllPrefix: 'दोनों / सभी चुनें',
    itemsWord: 'आइटम',
    receivedPausedNote: 'ऊपर संख्या चुनें या प्राप्त गिनती बोलकर/लिखकर बताएं।',
    queuedLabel: 'कतार में',
    speakConfirmOrEditBtn: 'माइक से “OK / हाँ” या बदलाव बोलें',
    listeningReplyStopBtn: 'सुन रहे हैं (“OK / हाँ” या बदलाव बोलें)… रोकने के लिए टैप करें',
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
    confirmHintVoice: 'ಮೈಕ್ ಮೂಲಕ ಉಳಿಸಲು “OK”, “Confirm”, “ಹೌದು” ಅಥವಾ “ಸರಿ” ಹೇಳಿ — ಅಥವಾ ತಿದ್ದುಪಡಿ ಹೇಳಿ',
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
    draftReorder: 'ವಾಟ್ಸಾಪ್ ರೀಆರ್ಡರ್ ಡ್ರಾಫ್ಟ್ ನಕಲಿಸಿ',
    reorderCopied: 'ರೀಆರ್ಡರ್ ಡ್ರಾಫ್ಟ್ ನಕಲಿಸಲಾಗಿದೆ!',
    badgeClarify: 'ಸ್ಪಷ್ಟಪಡಿಸಿ',
    badgeCorrected: 'ತಿದ್ದುಪಡಿ',
    badgeVerifySave: 'ಪರಿಶೀಲಿಸಿ ಉಳಿಸಿ',
    badgeSaved: 'ಉಳಿಸಲಾಗಿದೆ',
    badgeReview: 'ಪರಿಶೀಲನೆ',
    batchBadge: 'ಬ್ಯಾಚ್',
    deliveryItemsSuffix: 'ಡೆಲಿವರಿ ವಸ್ತುಗಳು',
    totalUnitsLabel: 'ಒಟ್ಟು ಘಟಕಗಳು',
    receivedWord: 'ಸ್ವೀಕರಿಸಿದ್ದು',
    damagedWord: 'ಹಾಳಾದದ್ದು',
    skusCountSuffix: 'ವಸ್ತುಗಳು',
    addItemBtn: 'ಹೊಸ ವಸ್ತು',
    closeBtn: 'ಮುಚ್ಚಿ',
    addProductTitle: 'ಪಟ್ಟಿಗೆ ಹೊಸ ವಸ್ತು ಸೇರಿಸಿ',
    addProductNamePlaceholder: 'ವಸ್ತುವಿನ ಹೆಸರು (ಉದಾ. Amul Butter 100g)',
    addProductAliasPlaceholder: 'ಬಳಕೆಯ ಹೆಸರುಗಳು, ಕಾಮಾ ಹಾಕಿ (ಉದಾ. maida, mida)',
    startingStockLabel: 'ಆರಂಭಿಕ ದಾಸ್ತಾನು',
    lowAlertLabel: 'ಕಡಿಮೆ ಎಚ್ಚರಿಕೆ (<)',
    addingBtn: 'ಸೇರಿಸಲಾಗುತ್ತಿದೆ…',
    saveToCatalogueBtn: 'ದಾಸ್ತಾನು ಪಟ್ಟಿಗೆ ಉಳಿಸಿ',
    noFilterMatches: 'ಈ ಫಿಲ್ಟರ್‌ಗೆ ಯಾವುದೇ ವಸ್ತು ಕಂಡುಬಂದಿಲ್ಲ.',
    usableLabel: 'ಬಳಸಬಹುದಾದ',
    returnLabel: 'ವಾಪಸ್',
    reasonPlaceholder: 'ಕಾರಣ (ಉದಾ. ಮಾರಾಟ, ಆರಂಭಿಕ ದಾಸ್ತಾನು)',
    savingShortBtn: 'ಉಳಿಸಲಾಗುತ್ತಿದೆ…',
    updateBtn: 'ನವೀಕರಿಸಿ',
    cannotGoNegative: 'ದಾಸ್ತಾನನ್ನು 0 ಕ್ಕಿಂತ ಕಡಿಮೆ ಮಾಡಲು ಆಗುವುದಿಲ್ಲ.',
    removeSkuConfirm: 'ವಸ್ತು ಮತ್ತು ಇತಿಹಾಸ ಅಳಿಸಬೇಕೇ?',
    keepBtn: 'ಇರಿಸಿ',
    confirmDeleteBtn: 'ಅಳಿಸುವುದನ್ನು ದೃಢಪಡಿಸಿ',
    removeSkuLink: 'ಪಟ್ಟಿಯಿಂದ ತೆಗೆದುಹಾಕಿ',
    entriesSuffix: 'ನಮೂದುಗಳು',
    usableDeltaWord: 'ಬಳಸಬಹುದಾದ',
    dmgShortWord: 'ಹಾಳಾದ',
    settingsTitle: 'ಅಂಗಡಿ ಪ್ರೊಫೈಲ್ ಮತ್ತು ಸೆಟ್ಟಿಂಗ್‌ಗಳು',
    storeProfileTitle: 'ಅಂಗಡಿ ಪ್ರೊಫೈಲ್',
    storeProfileUnset: 'ರೀಆರ್ಡರ್ ಸಂದೇಶಕ್ಕಾಗಿ ಅಂಗಡಿ ಹೆಸರು ಸೇರಿಸಿ',
    shopNameLabel: 'ಅಂಗಡಿ ಹೆಸರು',
    shopNamePlaceholder: 'ಉದಾ. ಶ್ರೀ ಲಕ್ಷ್ಮಿ ಕಿರಾಣಿ ಸ್ಟೋರ್',
    ownerNameLabel: 'ಮಾಲೀಕರ ಹೆಸರು',
    ownerNamePlaceholder: 'ಉದಾ. ರಮೇಶ್ / ರವಿ',
    locationNoteLabel: 'ವಿಳಾಸ / ಊರು',
    locationNotePlaceholder: 'ಉದಾ. ಇಂದಿರಾನಗರ • ಫೋನ್',
    saveProfileBtn: 'ಪ್ರೊಫೈಲ್ ಉಳಿಸಿ',
    profileSavedNote: 'ಉಳಿಸಲಾಗಿದೆ',
    voicePrefsTitle: 'ಧ್ವನಿ ಮತ್ತು ಭಾಷಾ ಆಯ್ಕೆಗಳು',
    preferredLangLabel: 'ಆ್ಯಪ್ ಮತ್ತು ಧ್ವನಿ ಭಾಷೆ',
    spokenReadbackTitle: 'ಧ್ವನಿ ಪರಿಶೀಲನೆ',
    ttsSubtitle: 'ದೃಢೀಕರಣ ಮತ್ತು ಪ್ರಶ್ನೆಗಳನ್ನು ಓದಿ ಹೇಳುತ್ತದೆ',
    mutedBtn: 'ಮ್ಯೂಟ್',
    activeBtn: 'ಸಕ್ರಿಯ',
    autoFollowUpTitle: 'ಸ್ವಯಂಚಾಲಿತ ಫಾಲೋ-ಅಪ್ ಮೈಕ್',
    autoFollowUpSubtitle: 'ಧ್ವನಿ ಓದಿದ ನಂತರ “ಸರಿ / OK” ಕೇಳಲು ಮೈಕ್ ತಾನಾಗೇ ತೆರೆಯುತ್ತದೆ',
    onBtn: 'ಆನ್',
    offBtn: 'ಆಫ್',
    engineReadyTitle: 'ಆಫ್‌ಲೈನ್ ಧ್ವನಿ ಎಂಜಿನ್ ಸಕ್ರಿಯವಾಗಿದೆ',
    engineReadyDesc: 'ಸ್ಥಳೀಯ Whisper STT • PostgreSQL ಲೆಡ್ಜರ್ • API ಕೀ ಅಗತ್ಯವಿಲ್ಲ',
    engineConnectingDesc: 'ಸ್ಥಳೀಯ Whisper ಮತ್ತು PostgreSQL ಸೇವೆಗೆ ಸಂಪರ್ಕಿಸಲಾಗುತ್ತಿದೆ…',
    noOsVoiceNote: 'ಬ್ರೌಸರ್‌ನಲ್ಲಿ ಕನ್ನಡ ಧ್ವನಿ ಪ್ಯಾಕ್ ಇಲ್ಲದ ಕಾರಣ ರೋಮನ್ ಧ್ವನಿ ಓದಲಾಗುತ್ತಿದೆ — ಪರದೆಯ ಪಠ್ಯ ಕನ್ನಡದಲ್ಲೇ ಇದೆ.',
    selectBothAllPrefix: 'ಎರಡನ್ನೂ / ಎಲ್ಲವನ್ನೂ ಆಯ್ಕೆಮಾಡಿ',
    itemsWord: 'ವಸ್ತುಗಳು',
    receivedPausedNote: 'ಮೇಲಿನ ಸಂಖ್ಯೆಯನ್ನು ಟ್ಯಾಪ್ ಮಾಡಿ ಅಥವಾ ಸ್ವೀಕರಿಸಿದ ಸಂಖ್ಯೆಯನ್ನು ಹೇಳಿ/ಟೈಪ್ ಮಾಡಿ.',
    queuedLabel: 'ಸರದಿಯಲ್ಲಿ',
    speakConfirmOrEditBtn: 'ಮೈಕ್‌ನಲ್ಲಿ “OK / ಸರಿ” ಅಥವಾ ತಿದ್ದುಪಡಿ ಹೇಳಿ',
    listeningReplyStopBtn: 'ಕೇಳುತ್ತಿದೆ (“OK / ಸರಿ” ಅಥವಾ ತಿದ್ದುಪಡಿ ಹೇಳಿ)… ನಿಲ್ಲಿಸಲು ಟ್ಯಾಪ್ ಮಾಡಿ',
  },
};

const UNIT_MAP: Record<string, Record<LangCode, string>> = {
  kg: { en: 'kg', hi: 'किग्रा', kn: 'ಕೆಜಿ' },
  packets: { en: 'packets', hi: 'पैकेट', kn: 'ಪ್ಯಾಕೆಟ್' },
  packet: { en: 'packet', hi: 'पैकेट', kn: 'ಪ್ಯಾಕೆಟ್' },
  bottles: { en: 'bottles', hi: 'बोतल', kn: 'ಬಾಟಲಿ' },
  bottle: { en: 'bottle', hi: 'बोतल', kn: 'ಬಾಟಲಿ' },
  crates: { en: 'crates', hi: 'पेटी', kn: 'ಕ್ರೇಟ್' },
  crate: { en: 'crate', hi: 'पेटी', kn: 'ಕ್ರೇಟ್' },
  pieces: { en: 'pieces', hi: 'पीस', kn: 'ಪೀಸ್' },
  piece: { en: 'piece', hi: 'पीस', kn: 'ಪೀಸ್' },
  dozens: { en: 'dozens', hi: 'दर्जन', kn: 'ಡಜನ್' },
  dozen: { en: 'dozen', hi: 'दर्जन', kn: 'ಡಜನ್' },
  leaves: { en: 'leaves', hi: 'पत्ते', kn: 'ಎಲೆಗಳು' },
  bags: { en: 'bags', hi: 'बोरी', kn: 'ಚೀಲ' },
  bag: { en: 'bag', hi: 'बोरी', kn: 'ಚೀಲ' },
  trays: { en: 'trays', hi: 'ट्रे', kn: 'ಟ್ರೇ' },
  tray: { en: 'tray', hi: 'ट्रे', kn: 'ಟ್ರೇ' },
  boxes: { en: 'boxes', hi: 'डिब्बे', kn: 'ಬಾಕ್ಸ್' },
  box: { en: 'box', hi: 'डिब्बा', kn: 'ಬಾಕ್ಸ್' },
};

export function formatUnit(unit: string | null | undefined, lang: LangCode): string {
  if (!unit) return UNIT_MAP.packets[lang];
  const key = unit.trim().toLowerCase();
  return UNIT_MAP[key]?.[lang] ?? unit;
}

export function formatLocalizedReadback(entries: PendingEntry[], lang: LangCode): string {
  if (entries.length === 0) return '';
  if (entries.length === 1) {
    const e = entries[0];
    const u = formatUnit(e.unit, lang);
    if (lang === 'hi') {
      return e.damaged > 0
        ? `${e.received} ${u} ${e.product_name} प्राप्त हुए, ${e.damaged} खराब, ${e.usable} स्टॉक में जुड़ेंगे। सहेजने के लिए "हाँ" या "Confirm" बोलें।`
        : `${e.received} ${u} ${e.product_name} प्राप्त हुए, कोई खराब नहीं, ${e.usable} स्टॉक में जुड़ेंगे। सहेजने के लिए "हाँ" या "Confirm" बोलें।`;
    }
    if (lang === 'kn') {
      return e.damaged > 0
        ? `${e.received} ${u} ${e.product_name} ಬಂದಿದೆ, ${e.damaged} ಹಾಳಾಗಿದೆ, ${e.usable} ದಾಸ್ತಾನಿಗೆ ಸೇರಲಿದೆ. ಉಳಿಸಲು "ಸರಿ" ಅಥವಾ "Confirm" ಹೇಳಿ.`
        : `${e.received} ${u} ${e.product_name} ಬಂದಿದೆ, ಹಾಳಾದದ್ದು ಇಲ್ಲ, ${e.usable} ದಾಸ್ತಾನಿಗೆ ಸೇರಲಿದೆ. ಉಳಿಸಲು "ಸರಿ" ಅಥವಾ "Confirm" ಹೇಳಿ.`;
    }
    return e.damaged > 0
      ? `${e.received} ${u} of ${e.product_name} received, ${e.damaged} damaged, adding ${e.usable} usable to stock. Say Confirm to save, or tell me what to change.`
      : `${e.received} ${u} of ${e.product_name} received, none damaged, adding ${e.usable} to stock. Say Confirm to save, or tell me what to change.`;
  }

  const parts = entries.map((e) => {
    const u = formatUnit(e.unit, lang);
    if (lang === 'hi') {
      return e.damaged > 0
        ? `${e.received} ${u} ${e.product_name} (${e.damaged} खराब, ${e.usable} उपयोगी)`
        : `${e.usable} ${u} ${e.product_name}`;
    }
    if (lang === 'kn') {
      return e.damaged > 0
        ? `${e.received} ${u} ${e.product_name} (${e.damaged} ಹಾಳಾದ, ${e.usable} ಬಳಕೆ)`
        : `${e.usable} ${u} ${e.product_name}`;
    }
    return e.damaged > 0
      ? `${e.received} ${u} ${e.product_name} (${e.damaged} damaged, ${e.usable} usable)`
      : `${e.usable} ${u} ${e.product_name}`;
  });
  const joined = parts.join('; ');
  if (lang === 'hi') {
    return `${entries.length} आइटम तैयार हैं: ${joined}। सभी को सहेजने के लिए "हाँ" या "Confirm" बोलें।`;
  }
  if (lang === 'kn') {
    return `${entries.length} ವಸ್ತುಗಳು ಸಿದ್ಧವಾಗಿವೆ: ${joined}. ಎಲ್ಲವನ್ನೂ ಉಳಿಸಲು "ಸರಿ" ಅಥವಾ "Confirm" ಹೇಳಿ.`;
  }
  return `${entries.length} items ready: ${joined}. Say Confirm to save all, or review below.`;
}

export function formatLocalizedQuestion(
  parseResult: ParseResponse,
  draft: PendingDraft,
  lang: LangCode,
): string | null {
  const kind = parseResult.question_kind;
  if (kind === 'teen_tens' && draft.teen_tens_options && draft.teen_tens_options.length >= 2) {
    const [low, high] = [...draft.teen_tens_options].sort((a, b) => a - b);
    if (lang === 'hi') return `क्या आपने ${low} बोला या ${high}?`;
    if (lang === 'kn') return `ನೀವು ${low} ಹೇಳಿದಿರಾ ಅಥವಾ ${high}?`;
    return `Did you say ${low} or ${high}?`;
  }
  if (kind === 'variant' && parseResult.candidates && parseResult.candidates.length > 0) {
    const names = parseResult.candidates.map((c) => c.product_name).join(lang === 'en' ? ' or ' : lang === 'hi' ? ' या ' : ' ಅಥವಾ ');
    if (lang === 'hi') return `आपका मतलब कौन सा है: ${names}?`;
    if (lang === 'kn') return `ನೀವು ಹೇಳಿದ್ದು ಯಾವುದು: ${names}?`;
    return `Which one did you mean: ${names}?`;
  }
  if (kind === 'received_qty') {
    const name = draft.product_name ?? (lang === 'hi' ? 'इस सामान' : lang === 'kn' ? 'ಈ ವಸ್ತುವಿನ' : 'this item');
    const unitText = formatUnit(draft.unit, lang);
    if (lang === 'hi') return `${name} के कितने ${unitText} मिले?`;
    if (lang === 'kn') return `${name} ಎಷ್ಟು ${unitText} ಬಂದಿದೆ?`;
    return `How many ${unitText} of ${name} did you receive?`;
  }
  if (kind === 'damaged_qty') {
    const name = draft.product_name ?? (lang === 'hi' ? 'इस सामान' : lang === 'kn' ? 'ಈ ವಸ್ತುವಿನ' : 'this item');
    if (lang === 'hi') return `${name} के कितने पैकेट/इकाइयाँ खराब हैं?`;
    if (lang === 'kn') return `${name} ಎಷ್ಟು ಹಾಳಾಗಿದೆ?`;
    return `How many ${name} are damaged?`;
  }
  if (kind === 'unknown_sku') {
    const raw = parseResult.raw_transcript ?? '';
    if (lang === 'hi') return `'${raw}' कैटलॉग में नहीं मिला। ब्रांड का नाम फिर बोलें या नीचे से चुनें।`;
    if (lang === 'kn') return `'${raw}' ಪಟ್ಟಿಯಲ್ಲಿ ಸಿಗಲಿಲ್ಲ. ವಸ್ತುವಿನ ಹೆಸರನ್ನು ಮತ್ತೆ ಹೇಳಿ ಅಥವಾ ಕೆಳಗಿನಿಂದ ಆಯ್ಕೆಮಾಡಿ.`;
    return `I don't have '${raw}' in the catalogue. Say the brand name again or tap to pick.`;
  }
  return parseResult.question ?? null;
}

export function formatCommitSpeech(entries: PendingEntry[], lang: LangCode): string {
  if (entries.length > 1) {
    const total = entries.reduce((sum, e) => sum + e.usable, 0);
    if (lang === 'hi') return `${entries.length} आइटम, कुल ${total} उपयोगी स्टॉक में सहेजे गए। अगला सामान बोलें।`;
    if (lang === 'kn') return `${entries.length} ವಸ್ತುಗಳು, ಒಟ್ಟು ${total} ದಾಸ್ತಾನಿನಲ್ಲಿ ಉಳಿಸಲಾಗಿದೆ. ಮುಂದಿನ ವಸ್ತು ಹೇಳಿ.`;
    return `Saved ${entries.length} items, ${total} total usable. Next item?`;
  }
  const usable = entries[0]?.usable ?? 0;
  if (lang === 'hi') return `${usable} उपयोगी स्टॉक सहेजा गया। अगला सामान बोलें।`;
  if (lang === 'kn') return `${usable} ಬಳಸಬಹುದಾದ ದಾಸ್ತಾನು ಉಳಿಸಲಾಗಿದೆ. ಮುಂದಿನ ವಸ್ತು ಹೇಳಿ.`;
  return `Saved ${usable} usable. Next item?`;
}

/** Romanized fallback speech strings for browsers without local Hindi/Kannada voice packs. */
export function formatLocalizedReadbackFallback(entries: PendingEntry[], lang: LangCode): string {
  if (entries.length === 0) return '';
  if (lang === 'en') return formatLocalizedReadback(entries, 'en');

  if (entries.length === 1) {
    const e = entries[0];
    const u = e.unit || 'packets';
    if (lang === 'hi') {
      return e.damaged > 0
        ? `${e.received} ${u} ${e.product_name} mila, ${e.damaged} kharab, ${e.usable} upyog mein. Confirm karne ke liye Haan ya Confirm bolein.`
        : `${e.received} ${u} ${e.product_name} mila, sab theek, ${e.usable} upyog mein. Confirm karne ke liye Haan ya Confirm bolein.`;
    }
    return e.damaged > 0
      ? `${e.received} ${u} ${e.product_name} bandide, ${e.damaged} odada, ${e.usable} upayogakke. Save maadalu Sari athava Confirm heli.`
      : `${e.received} ${u} ${e.product_name} bandide, ella sari ide, ${e.usable} upayogakke. Save maadalu Sari athava Confirm heli.`;
  }

  const parts = entries.map((e) => {
    const u = e.unit || 'packets';
    if (lang === 'hi') {
      return e.damaged > 0
        ? `${e.received} ${u} ${e.product_name}, ${e.damaged} kharab, ${e.usable} upyogi`
        : `${e.usable} ${u} ${e.product_name}`;
    }
    return e.damaged > 0
      ? `${e.received} ${u} ${e.product_name}, ${e.damaged} odada, ${e.usable} upayoga`
      : `${e.usable} ${u} ${e.product_name}`;
  });
  const joined = parts.join('; ');
  if (lang === 'hi') {
    return `${entries.length} items ready hain: ${joined}. Sab save karne ke liye Haan ya Confirm bolein.`;
  }
  return `${entries.length} items ready ide: ${joined}. Ella save maadalu Sari athava Confirm heli.`;
}

export function formatLocalizedQuestionFallback(
  parseResult: ParseResponse,
  draft: PendingDraft,
  lang: LangCode,
): string | null {
  if (lang === 'en') return formatLocalizedQuestion(parseResult, draft, 'en');
  const kind = parseResult.question_kind;
  const itemFallback = lang === 'hi' ? 'is item' : 'ee item';
  const name = draft.product_name ?? itemFallback;
  const unitText = draft.unit || 'packets';

  if (kind === 'teen_tens' && draft.teen_tens_options && draft.teen_tens_options.length >= 2) {
    const [low, high] = [...draft.teen_tens_options].sort((a, b) => a - b);
    return lang === 'hi'
      ? `Aapne ${low} bola ya ${high}?`
      : `Neevu ${low} heldira athava ${high}?`;
  }
  if (kind === 'variant' && parseResult.candidates && parseResult.candidates.length > 0) {
    const sep = lang === 'hi' ? ' ya ' : ' athava ';
    const names = parseResult.candidates.map((c) => c.product_name).join(sep);
    return lang === 'hi' ? `Kaun sa chahiye: ${names}?` : `Neevu heliddu yaavudu: ${names}?`;
  }
  if (kind === 'received_qty') {
    return lang === 'hi'
      ? `${name} ke kitne ${unitText} mile?`
      : `${name} eshtu ${unitText} bandide?`;
  }
  if (kind === 'damaged_qty') {
    return lang === 'hi'
      ? `${name} mein kitne kharab hain?`
      : `${name} eshtu odada ide?`;
  }
  if (kind === 'unknown_sku') {
    const raw = parseResult.raw_transcript ?? '';
    return lang === 'hi'
      ? `${raw} catalogue mein nahi mila. Brand ka naam phir bolein.`
      : `${raw} pattiyalli sigalilla. Item hesaru matte heli.`;
  }
  return parseResult.question ?? formatLocalizedQuestion(parseResult, draft, 'en');
}

export function formatCommitSpeechFallback(entries: PendingEntry[], lang: LangCode): string {
  if (lang === 'en') return formatCommitSpeech(entries, 'en');
  if (entries.length > 1) {
    const total = entries.reduce((sum, e) => sum + e.usable, 0);
    return lang === 'hi'
      ? `${entries.length} items, kul ${total} stock mein save ho gaye. Agla item bolein.`
      : `${entries.length} items, ottu ${total} stock nalli save aagide. Mundina item heli.`;
  }
  const usable = entries[0]?.usable ?? 0;
  return lang === 'hi'
    ? `${usable} upyogi stock save ho gaya. Agla item bolein.`
    : `${usable} upayogakke stock save aagide. Mundina item heli.`;
}
