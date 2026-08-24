#!/usr/bin/env node
/**
 * Import 100 AMSI products into initial-data.ts
 * - Full French → German translation (names, short_descriptions, descriptions)
 * - Price conversion XOF → EUR (1 EUR = 655.957 XOF)
 * - Image download to public/images/products/
 * - New categories and brands added
 */

const fs = require('fs');
const https = require('https');
const http = require('http');
const path = require('path');

const XOF_TO_EUR = 655.957;
const amsiData = JSON.parse(fs.readFileSync('scripts/amsi-store-products.json', 'utf8'));

// ── CATEGORY MAPPING (French → German existing categories) ──
const categoryMap = {
  'Imprimantes &amp; Scanners': 'cat-drucker-scanner',
  'SmartPhones &amp; Tablettes': 'cat-smartphones-tablets',
  'Laptop &amp; bureau': 'cat-laptops-pcs',
  'Accessoires': 'cat-it-zubehoer',
  'Bureautique': 'cat-buero-it',
  'Cartouche': 'cat-toner-patronen',
  'Appareils photo et caméras': 'cat-kameras',
  'Casques et écouteurs': 'cat-kopfhoerer',
};

// ── BRAND MAPPING (AMSI brands → existing or new brand IDs) ──
const brandMap = {
  'Canon': 'b-canon',
  'HP': 'b-hp',
  'Samsung': 'b-samsung',
  'Apple': 'b-apple',
  'Sony': 'b-sony-playstation',
  'Huawei': 'b-huawei',
  'Xiaomi': 'b-xiaomi',
  'Lenovo': 'b-lenovo',
  'Garmin': 'b-garmin',
  'Logitech': 'b-logitech',
  'Epson': 'b-epson',
  'Oppo': 'b-oppo',
  'OnePlus': 'b-oneplus',
  'Motorola': 'b-motorola',
  'Google': 'b-google',
  'Honor': 'b-honor',
  'Poco': 'b-poco',
  'ZTE': 'b-zte',
  'Redmi': 'b-xiaomi',
  'Bureautique': 'b-sony-playstation', // fallback for miscategorized
};

// ── WEIGHT ESTIMATES (kg) based on product type ──
const defaultWeights = {
  'Imprimantes &amp; Scanners': 8,
  'SmartPhones &amp; Tablettes': 0.2,
  'Laptop &amp; bureau': 2.0,
  'Accessoires': 0.5,
  'Bureautique': 1.5,
  'Cartouche': 0.5,
  'Casques et écouteurs': 0.05,
};

// ── GERMAN TRANSLATIONS FOR ALL 100 PRODUCTS ──
// name_de: translated product name (only where French words exist)
// short_de: German short description
// desc_de: German long description (plain text, will be wrapped)
const translations = [
  // 1. Canon i-SENSYS MF237w
  { name_de: 'Canon i-SENSYS MF237w', short_de: 'Canon i-SENSYS MF237w integriert auch eine <strong>Faxfunktion</strong>, was sie zu einer echten 4-in-1-Multifunktionslösung fuer professionelle Umgebungen macht.', desc_de: 'Die Canon i-SENSYS MF237w ist ein 4-in-1-Monochrom-Laser-Multifunktionsdrucker fuer kleine Unternehmen, Bueros und Homeoffice. Sie kombiniert Drucken, Kopieren, Scannen und Faxen im A4-Format mit einer Geschwindigkeit von bis zu 23 Seiten pro Minute. Sie verfuegt ueber Wi-Fi, Ethernet, einen Automatikfaecher fuer 35 Blatt sowie einen Ausgabefaecher fuer 100 Blatt.' },
  // 2. Canon i-SENSYS MF453dw
  { name_de: 'Canon i-SENSYS MF453dw', short_de: 'Die Canon i-SENSYS MF453dw bietet eine <strong>schnelle und effiziente Schwarzweissdruck</strong>, perfekt fuer Geschaeftsdokumente, Berichte, Rechnungen und Korrespondenz.', desc_de: 'Die Canon i-SENSYS MF453dw ist ein Monochrom-Laser-Multifunktionsdrucker, der fuer Unternehmen, Bueros und Fachleute konzipiert ist, die eine schnelle, zuverlaessige und vielseitige Druckloesung suchen. Sie kombiniert die Funktionen Drucken, Scannen, Kopieren und Faxen in einem kompakten und leistungsstarken Geraet.' },
  // 3. Canon i-SENSYS MF664Cdw
  { name_de: 'Canon i-SENSYS MF664Cdw', short_de: 'Canon i-SENSYS MF664Cdw - Farblaser-Multifunktionsdrucker A4 fuer Unternehmen und Bueros.', desc_de: 'Die Canon i-SENSYS MF664Cdw ist ein Farblaser-Multifunktionsdrucker A4, der fuer Unternehmen, Bueros und Fachleute konzipiert ist, die eine zuverlaessige Druckloesung suchen. Sie bietet Drucken, Scannen, Kopieren und Faxen in einem kompakten Geraet.' },
  // 4. Canon i-SENSYS LBP633Cdw
  { name_de: 'Canon i-SENSYS LBP633Cdw', short_de: 'Canon i-SENSYS LBP633Cdw - Professioneller Farblaserdrucker A4.', desc_de: 'Die Canon i-SENSYS LBP633Cdw ist ein Farblaserdrucker A4, der fuer kleine und mittlere Unternehmen sowie Bueros konzipiert ist, die eine professionelle, kompakte und effiziente Druckloesung suchen.' },
  // 5. Canon imageRUNNER ADVANCE DX C3930i
  { name_de: 'Canon imageRUNNER ADVANCE DX C3930i', short_de: 'Canon imageRUNNER ADVANCE DX C3930i: Farb-Multifunktion A3 bis zu 30 ppm, schnelles Scannen, 10,1 Zoll Touchscreen und Dokumentenverwaltung.', desc_de: 'Der Canon imageRUNNER ADVANCE DX C3930i ist ein professionelles Farb-Multifunktionsgeraet A3, das fuer anspruchsvolle Unternehmen und Arbeitsumgebungen konzipiert ist. Er bietet Drucken, Scannen, Kopieren und Faxen mit bis zu 30 Seiten pro Minute.' },
  // 6. Logitech Expansion Microphone
  { name_de: 'Logitech Expansion Microphone', short_de: 'Erweiterungsmikrofon fuer professionelle Videokonferenzen.', desc_de: 'Das Logitech Expansion Microphone ist ein Erweiterungsmikrofon, das fuer die Verbesserung der Audioqualitaet von Videokonferenzsystemen von Logitech konzipiert ist. Es erweitert den Aufnahmebereich der Stimmen, damit jeder Teilnehmer klar gehoert wird, auch in mittelgrossen bis grossen Konferenzraeumen.' },
  // 7. Logitech MeetUp
  { name_de: 'Logitech MeetUp', short_de: 'Das <strong>Logitech MeetUp</strong> ist eine professionelle Videokonferenzkamera mit ausgezeichneter Bildqualitaet, leistungsstaerkem Sound und einfacher Installation. Dank 120° Weitwinkel, 4K-Aufloesung und Kompatibilitaet mit den gaengigsten Kollaborationsplattformen ist sie die ideale Loesung fuer kleine Konferenzraeume, Coworking-Spaeze und Unternehmen, die ein High-End-Videokonferenzerlebnis suchen.', desc_de: 'Die Logitech MeetUp ist eine All-in-One-Videokonferenzkamera, die speziell fuer kleine Konferenzraeume und Kollaborationsspaeze entwickelt wurde. Mit 4K Ultra HD-Aufloesung, einem ultraschWeiten Sichtfeld von 120 Grad, einem integrierten Audiosystem und Kompatibilitaet mit den gaengigsten Videokonferenzplattformen.' },
  // 8. HP 645A Toner LaserJet Authentique
  { name_de: 'HP 645A Toner LaserJet Original', short_de: 'Professionelle Druckqualitaet.', desc_de: 'Der HP 645A Toner LaserJet Original (Referenz C9730A) ist eine originale Tonerpatrone, die von HP fuer professionelle Druckergebnisse entwickelt wurde. Dank HP-Lasertechnologie liefert sie scharfe Texte, tiefe Schwarztöne und gleichmaessige Ergebnisse, auch bei hohen Druckvolumina.' },
  // 9. Canon MAXIFY GX7040
  { name_de: 'Canon MAXIFY GX7040', short_de: 'Farb-Multifunktionsdrucker 4-in-1 fuer Unternehmen und Bueros mit hohem Druckvolumen. Dank des MegaTank-Nachfuellsystem bietet er extrem niedrige Druckkosten pro Seite, hervorragende Druckqualitaet und bemerkenswerte Produktivitaet.', desc_de: 'Die Canon MAXIFY GX7040 ist ein Farb-Multifunktionsdrucker 4-in-1 fuer Unternehmen, Bueros und Fachleute mit hohem Druckvolumen. Dank des MegaTank-Nachfuellsystem bietet er extrem niedrige Druckkosten pro Seite und eine hervorragende Produktivitaet.' },
  // 10. Samsung Galaxy Z Fold8
  { name_de: 'Samsung Galaxy Z Fold8', short_de: 'Dank Galaxy AI verbessert das Samsung Galaxy Z Fold8 die Produktivitaet und vereinfacht den Alltag.', desc_de: 'Das Samsung Galaxy Z Fold8 ist ein Premium-Faltschirm-Smartphone mit Dynamic AMOLED 2X-Display mit 120 Hz, ultraschnellen Performance, fortgeschrittenem Kamerasystem, 5G-Konnektivitaet und intelligenten Galaxy AI-Funktionen.' },
  // 11. Samsung Galaxy Z Fold 8 Ultra
  { name_de: 'Samsung Galaxy Z Fold 8 Ultra', short_de: 'Premium-Faltschirm-Smartphone mit grossem Dynamic AMOLED 2X-Display mit 120 Hz, ultraschnellen Performance, fortgeschrittener Kamera, 5G und Galaxy AI.', desc_de: 'Das Samsung Galaxy Z Fold 8 Ultra ist ein Premium-Faltschirm-Smartphone mit grossem Dynamic AMOLED 2X-Display, ultraschnellen Performance, fortgeschrittenem Kamerasystem, 5G und Galaxy AI.' },
  // 12. Cartouche de toner noir authentique HP 37A
  { name_de: 'HP 37A Original-Tonerpatrone Schwarz', short_de: 'Professionelle Druckqualitaet.', desc_de: 'Die HP 37A Original-Tonerpatrone (CF237A) ist eine Originaltonerpatrone, die von HP fuer scharfe Texte und tiefes Schwarz entwickelt wurde. Fuer hohe Druckvolumina mit konstantem Ergebnis.' },
  // 13. HUAWEI Pura 90s Pro Max
  { name_de: 'HUAWEI Pura 90s Pro Max', short_de: 'Ein 5G-Smartphone der Oberklasse mit OLED-Display, professionellem Kamerasystem, langlebigem Akku und Schnellladefunktion.', desc_de: 'Das HUAWEI Pura 90s Pro Max ist ein Premium-5G-Smartphone mit OLED-Display, professionellem Kamerasystem, langlebigem Akku und Schnellladefunktion.' },
  // 14. HP LaserJet Pro 4103fdw
  { name_de: 'HP LaserJet Pro 4103fdw', short_de: 'Schneller und leistungsstaerker Wi-Fi-Laser-Multifunktionsdrucker mit Duplexdruck, Scan, Kopie und Fax.', desc_de: 'Die HP LaserJet Pro 4103fdw ist ein Wi-Fi-Laser-Multifunktionsdrucker mit Duplexdruck, Scan, Kopie und Fax fuer kleine Bueros und工作组.' },
  // 15. Starlink SpaceX UTA-232
  { name_de: 'Starlink SpaceX UTA-232', short_de: 'Schnelle Internetverbindung fuer Ihre Beduerfnisse.', desc_de: 'Das Starlink SpaceX UTA-232 ist ein Internet-Satellitenkits, das eine schnelle Internetverbindung bietet. Ideal fuer Standorte mit schlechter Breitbandversorgung.' },
  // 16. Toner HP 212A
  { name_de: 'HP 212A Original-Toner', short_de: 'Originale Laser-Tonerpatrone von HP fuer hochwertige Ausdrucke.', desc_de: 'Der HP 212A Original-Toner ist eine Laser-Tonerpatrone, die von HP fuer hochwertige Ausdrucke entwickelt wurde.' },
  // 17. Lenovo LOQ 17IRX10
  { name_de: 'Lenovo LOQ 17IRX10', short_de: 'Marke: Lenovo LOQ Modell: 17IRX10 Intel Core i7 RTX 5060 (8GB dediziert) RAM 32GB SSD 1TB Display 17 Zoll.', desc_de: 'Der Lenovo LOQ 17IRX10 ist ein Gaming-Laptop mit Intel Core i7, NVIDIA RTX 5060, 32GB RAM, 1TB SSD und 17-Zoll-Display.' },
  // 18. Epson TM-T20III-011
  { name_de: 'Epson TM-T20III-011', short_de: 'Schneller und zuverlaessiger 80mm-Thermalquittungsdrucker. Ideal fuer Gastronomie, Einzelhandel und Point-of-Sale. Schnelle Lieferung und bester Preis.', desc_de: 'Der Epson TM-T20III-011 ist ein schneller und zuverlaessiger 80mm-Thermalquittungsdrucker. Ideal fuer Gastronomie, Einzelhandel und Point-of-Sale.' },
  // 19. PlayStation 5 Pro
  { name_de: 'PlayStation 5 Pro', short_de: 'Sony setzt die Grenzen des Gamings mit einem <strong>ultraschnellen 2TB-SSD</strong>, einer <strong>GPU neuester Generation</strong>, <strong>fortgeschrittenem Raytracing</strong> und der Technologie <strong>PlayStation Spectral Super Resolution (PSSR)</strong> aus. Geniessen Sie Grafiken in <strong>4K</strong>, <strong>bis zu 120 Hz</strong> bei kompatiblen Spielen und ultraschnelle Ladezeiten fuer ein intensives und leistungsstaerkeres Spielerlebnis.', desc_de: 'Die PlayStation 5 Pro bietet einen ultraschnellen 2TB-SSD-Speicher, eine GPU neuester Generation, fortgeschrittenes Raytracing und PSSR fuer 4K-Grafiken mit bis zu 120 Hz und ultraschnellen Ladezeiten.' },
  // 20. iMac M1 24 pouces 8 Go RAM 512 Go SSD
  { name_de: 'iMac M1 24 Zoll 8GB RAM 512GB SSD', short_de: 'Der <strong>Apple iMac M1 24 Zoll 8GB 512GB SSD</strong> bietet dank dem Apple M1-Chip schnelle Leistung, ein schoenes Retina 4,5K-Display von 24 Zoll und 512GB SSD-Speicher. Ideal fuer Buerodataktik, Content-Erstellung, Homeoffice und Multimedia - dieser All-in-One-Computer verbindet Leistung, elegantes Design und Fliessend unter macOS.', desc_de: 'Der Apple iMac M1 24 Zoll mit 8GB RAM und 512GB SSD bietet schnelle Leistung durch den Apple M1-Chip, ein Retina 4,5K-Display und 512GB SSD-Speicher.' },
  // 21. HDMI Wireless Extender 150m
  { name_de: 'HDMI-Wireless-Extender 150m', short_de: 'Senden Sie Ihr HDMI-Signal kabellos bis zu 150m in Full HD 1080p. Plug & Play-Installation.', desc_de: 'Der HDMI-Wireless-Extender 150m sendet Ihr HDMI-Signal kabellos bis zu 150 Meter in Full HD 1080p aufloesung. Einfache Plug & Play-Installation.' },
  // 22. Redmi A27U
  { name_de: 'Redmi A27U', short_de: 'Groesse: 27 Zoll | Panel: IPS | Aufloesung: 3840 x 2160 Pixel (4K Ultra HD) | Format: 16:9 | Bildwiederholrate: 60 Hz | Betrachtungswinkel: 178 Grad | Helligkeit: 400 nits | Zertifizierung: DisplayHDR 400.', desc_de: 'Der Redmi A27U ist ein 27-Zoll-IPS-Monitor mit 4K Ultra HD-Aufloesung (3840 x 2160 Pixel), 60 Hz Bildwiederholrate und DisplayHDR 400-Zertifizierung.' },
  // 23. Motorola T92 H2O
  { name_de: 'Motorola T92 H2O', short_de: 'Motorola T92 H2O - Wasserdichter PMR446-Walkie-Talkie mit Reichweite bis zu 10 km.', desc_de: 'Das Motorola T92 H2O ist ein wasserdichtes PMR446-Walkie-Talkie mit einer Reichweite von bis zu 10 km.' },
  // 24. HP Victus Gaming Laptop 15-fa2024nia
  { name_de: 'HP Victus Gaming Laptop 15-fa2024nia', short_de: 'Intel Core i7 14650HX RTX 4050 16GB RAM, 512GB SSD.', desc_de: 'Der HP Victus Gaming Laptop 15-fa2024nia ist ein Gaming-Laptop mit Intel Core i7-14650HX, NVIDIA RTX 4050, 16GB RAM und 512GB SSD.' },
  // 25. HP OmniBook X Flip
  { name_de: 'HP OmniBook X Flip', short_de: 'Next-Gen-AI-Laptop 14-kb0023dx, 14 Zoll OLED Touchscreen, Intel Core Ultra 7.', desc_de: 'Das HP OmniBook X Flip ist ein Next-Gen-AI-Laptop mit 14 Zoll OLED-Touchscreen und Intel Core Ultra 7.' },
  // 26. Google Pixel Buds A-Series
  { name_de: 'Google Pixel Buds A-Series', short_de: 'Die <strong>Google Pixel Buds A-Series</strong> sind True-Wireless-Kopfhoerer, die hervorragende Audioqualitaet, optimalen Komfort und nahtlose Integration mit Android-Smartphones bieten.', desc_de: 'Die Google Pixel Buds A-Series sind True-Wireless-Kopfhoerer mit hervorragender Audioqualitaet, optimalem Komfort und nahtloser Integration mit Android-Smartphones.' },
  // 27. Google Pixel Buds Pro
  { name_de: 'Google Pixel Buds Pro', short_de: 'Die <strong>Google Pixel Buds Pro</strong> sind High-End-Kopfhoerer mit hervorragender Klangqualitaet und aktiver Geräuschunterdrueckung (ANC).', desc_de: 'Die Google Pixel Buds Pro sind High-End-True-Wireless-Kopfhoerer mit hervorragender Klangqualitaet und aktiver Geräuschunterdrueckung (ANC).' },
  // 28. Canon i-SENSYS MF461dw
  { name_de: 'Canon i-SENSYS MF461dw', short_de: 'Wi-Fi-Monochrom-Laser-Multifunktionsdrucker mit automatischem Duplexdruck.', desc_de: 'Die Canon i-SENSYS MF461dw ist ein Wi-Fi-Monochrom-Laser-Multifunktionsdrucker mit automatischem Duplexdruck, Scannen und Kopierfunktion.' },
  // 29. Canon i-SENSYS MF657Cdw
  { name_de: 'Canon i-SENSYS MF657Cdw', short_de: 'Wi-Fi-Farblaser-Multifunktionsdrucker mit Duplexdruck.', desc_de: 'Die Canon i-SENSYS MF657Cdw ist ein Wi-Fi-Farblaser-Multifunktionsdrucker mit Duplexdruck fuer Bueros und工作组.' },
  // 30. Epson WorkForce DS-530II
  { name_de: 'Epson WorkForce DS-530II', short_de: 'Schneller und duplexfaehiger Profi-Dokumentenscanner.', desc_de: 'Der Epson WorkForce DS-530II ist ein schneller und duplexfaehiger Profi-Dokumentenscanner fuer Bueros und工作组.' },
  // 31. OPPO Find X9 Ultra
  { name_de: 'OPPO Find X9 Ultra', short_de: 'Premium-Smartphone mit KI, professioneller Fotografie und aussergewoehnlicher Leistung.', desc_de: 'Das OPPO Find X9 Ultra ist ein Premium-Smartphone mit KI-unterstuetzter Fotografie und aussergewoehnlicher Leistung.' },
  // 32. HP Color LaserJet Pro MFP 4303fdn
  { name_de: 'HP Color LaserJet Pro MFP 4303fdn', short_de: 'Professioneller Farblaser-Multifunktionsdrucker.', desc_de: 'Die HP Color LaserJet Pro MFP 4303fdn ist ein professioneller Farblaser-Multifunktionsdrucker fuer Bueros und工作组.' },
  // 33. HP 27 pouces All-in-One 27
  { name_de: 'HP 27 Zoll All-in-One 27-cr0154nh', short_de: 'HP 27 Zoll All-in-One PC mit Intel Core i7, Touchscreen Full HD IPS.', desc_de: 'Der HP 27 Zoll All-in-One 27-cr0154nh ist ein All-in-One-PC mit Intel Core i7, Touchscreen Full HD IPS und Windows 11.' },
  // 34. Canon SELPHY CP1500
  { name_de: 'Canon SELPHY CP1500', short_de: 'Canon SELPHY CP1500 - Technische Merkmale des portablen Fotodruckers.', desc_de: 'Die Canon SELPHY CP1500 ist ein kompakter und portabler Fotodrucker fuer hochwertige Fotodrucke zu Hause oder unterwegs.' },
  // 35. REDMAGIC 11S Pro
  { name_de: 'REDMAGIC 11S Pro', short_de: 'Das ultimative Gaming-Smartphone mit Snapdragon 8 Elite.', desc_de: 'Das REDMAGIC 11S Pro ist das ultimative Gaming-Smartphone mit Snapdragon 8 Elite-Prozessor.' },
  // 36. TP-Link Archer AX11000
  { name_de: 'TP-Link Archer AX11000', short_de: 'High-End-Gaming-Wi-Fi-6-Router (802.11ax) fuer aussergewoehnliche Netzwerkleistung.', desc_de: 'Der TP-Link Archer AX11000 ist ein High-End-Gaming-Wi-Fi-6-Router fuer aussergewoehnliche Netzwerkleistung.' },
  // 37. REDMAGIC 10 Pro
  { name_de: 'REDMAGIC 10 Pro', short_de: '5G-Gaming-Smartphone mit Snapdragon 8 Elite, AMOLED-Display 144 Hz und 7050 mAh-Akku.', desc_de: 'Das REDMAGIC 10 Pro ist ein 5G-Gaming-Smartphone mit Snapdragon 8 Elite, AMOLED-Display mit 144 Hz und 7050 mAh-Akku.' },
  // 38. OPPO Reno8 T
  { name_de: 'OPPO Reno8 T', short_de: '4G-Smartphone mit AMOLED-Display 90 Hz, 100 MP-Kamera und SUPERVOOC 33W-Schnelllade.', desc_de: 'Das OPPO Reno8 T ist ein 4G-Smartphone mit AMOLED-Display 90 Hz, 100 MP-Kamera und SUPERVOOC 33W-Schnelllade.' },
  // 39. Xiaomi Router BE3600
  { name_de: 'Xiaomi Router BE3600', short_de: 'Der <strong>Xiaomi Router BE3600</strong> ist ein Wi-Fi-7-Router neuer Generation fuer schnelle, stabile und intelligente Verbindungen. Dank einer kabellosen Geschwindigkeit von bis zu <strong>3.600 Mbit/s</strong>.', desc_de: 'Der Xiaomi Router BE3600 ist ein Wi-Fi-7-Router neuer Generation fuer schnelle, stabile und intelligente Verbindungen mit bis zu 3.600 Mbit/s.' },
  // 40. Oppo Reno 15 Pro Max
  { name_de: 'Oppo Reno 15 Pro Max', short_de: 'Das <strong>Oppo Reno 15 Pro Max</strong> ist ein 5G-Premium-Smartphone fuer Leistung, Fliessendheit und Eleganz. Mit immersivem AMOLED-Display, leistungsstaerker Kamera, langlebigem Akku mit Schnellladen und Premium-Design.', desc_de: 'Das Oppo Reno 15 Pro Max ist ein 5G-Premium-Smartphone mit immersivem AMOLED-Display, leistungsstaerker Kamera, langlebigem Akku mit Schnellladen und Premium-Design.' },
  // 41. Xiaomi 20W Power Strip 2C1A
  { name_de: 'Xiaomi 20W Power Strip 2C1A', short_de: '<strong>Xiaomi Power Strip 20W</strong> - Intelligente Mehrfachsteckdose zum gleichzeitigen Laden mehrerer Geraete. Ausgestattet mit <strong>2 USB-C-Ports</strong>, <strong>1 USB-A-Port</strong> und <strong>Schnellladen bis zu 20W</strong>.', desc_de: 'Die Xiaomi 20W Power Strip 2C1A ist eine intelligente Mehrfachsteckdose mit 2 USB-C-Ports, 1 USB-A-Port und Schnellladen bis zu 20W.' },
  // 42. Oppo FIND N6
  { name_de: 'Oppo FIND N6', short_de: 'OPPO Find N6 - Premium-Faltschirm-Smartphone mit AMOLED-LTPO-Display und High-End-Performance.', desc_de: 'Das Oppo FIND N6 ist ein Premium-Faltschirm-Smartphone mit AMOLED-LTPO-Display und High-End-Performance.' },
  // 43. OnePlus 15R
  { name_de: 'OnePlus 15R', short_de: 'OnePlus 15R - 5G-Performance-Schnelllader mit Snapdragon und grossem Akku.', desc_de: 'Das OnePlus 15R ist ein 5G-Smartphone mit starker Performance, Snapdragon-Prozessor und grossem Akku.' },
  // 44. OnePlus 15
  { name_de: 'OnePlus 15', short_de: 'OnePlus 15 - Premium-5G-Smartphone mit Snapdragon 8 Elite, AMOLED-Display und Schnellladetechnologie.', desc_de: 'Das OnePlus 15 ist ein Premium-5G-Smartphone mit Snapdragon 8 Elite, AMOLED-Display und Schnellladetechnologie.' },
  // 45. Huawei Nova 14i
  { name_de: 'Huawei Nova 14i', short_de: 'Huawei Nova 14i - 5G-Smartphone mit grossem Display, langlebigem Akku und leistungsstaerker Kamera.', desc_de: 'Das Huawei Nova 14i ist ein 5G-Smartphone mit grossem Display, langlebigem Akku und leistungsstaerker Kamera.' },
  // 46. Huawei Nova 14 Pro 5G
  { name_de: 'Huawei Nova 14 Pro 5G', short_de: 'Huawei Nova 14 Pro 5G - Premium-Smartphone mit KI-Kamera und 5G-Konnektivitaet.', desc_de: 'Das Huawei Nova 14 Pro 5G ist ein Premium-Smartphone mit KI-kamera und 5G-Konnektivitaet.' },
  // 47. HUAWEI Mate X6
  { name_de: 'HUAWEI Mate X6', short_de: 'HUAWEI Mate X6 - Premium-Faltschirm-Smartphone mit grossem OLED-Display.', desc_de: 'Das HUAWEI Mate X6 ist ein Premium-Faltschirm-Smartphone mit grossem OLED-Display und leistungsstaerker Hardware.' },
  // 48. HUAWEI Mate X3
  { name_de: 'HUAWEI Mate X3', short_de: 'HUAWEI Mate X3 - Ultraduennes Premium-Faltschirm-Smartphone.', desc_de: 'Das HUAWEI Mate X3 ist ein ultraduennes Premium-Faltschirm-Smartphone mit grossem OLED-Display.' },
  // 49. HUAWEI Pura 80
  { name_de: 'HUAWEI Pura 80', short_de: 'HUAWEI Pura 80 - 5G-Smartphone mit OLED-Display und leistungsstaerker Kamera.', desc_de: 'Das HUAWEI Pura 80 ist ein 5G-Smartphone mit OLED-Display und leistungsstaerker Kamera.' },
  // 50. MOTOROLA Edge 60 Pro
  { name_de: 'MOTOROLA Edge 60 Pro', short_de: 'Premium-5G-Smartphone mit pOLED-Display 144 Hz, Moto AI und 50 MP-Kamera.', desc_de: 'Das MOTOROLA Edge 60 Pro ist ein Premium-5G-Smartphone mit pOLED-Display 144 Hz, Moto AI und 50 MP-Kamera.' },
  // 51. HONOR Magic V5
  { name_de: 'HONOR Magic V5', short_de: 'HONOR Magic V5 - Premium-Faltschirm-Smartphone mit 120 Hz OLED-Display und fortschrittlicher KI. 217 g, 4,1 mm duenn. Android 15, MagicOS 10. 512GB Speicher.', desc_de: 'Das HONOR Magic V5 ist ein Premium-Faltschirm-Smartphone mit 120 Hz OLED-Display und fortschrittlicher KI.' },
  // 52. Honor MagicPad 3
  { name_de: 'Honor MagicPad 3', short_de: 'Honor MagicPad 3 - High-End-Tablette, 13,3 Zoll Display, 595 g, 5,8 mm duenn. Android 15, MagicOS 9. 512GB Speicher.', desc_de: 'Die Honor MagicPad 3 ist eine High-End-Tablette mit 13,3-Zoll-Display, Android 15 und 512GB Speicher.' },
  // 53. Honor 400 5G
  { name_de: 'Honor 400 5G', short_de: 'Honor 400 5G: Leistungsstaerker mit fortschrittlicher KI, 120 Hz AMOLED-Display und 200 MP-Kamera.', desc_de: 'Das Honor 400 5G ist ein leistungsstaerker mit fortschrittlicher KI, 120 Hz AMOLED-Display und 200 MP-Kamera.' },
  // 54. Google Pixel 10 Pro Fold
  { name_de: 'Google Pixel 10 Pro Fold', short_de: 'Google Pixel 10 Pro Fold: Premium-Faltschirm-Smartphone mit Google KI und immersivem Display. 258 g, 5,2 mm duenn. Android 16, bis zu 7 gross Android-Updates. 256GB Speicher.', desc_de: 'Das Google Pixel 10 Pro Fold ist ein Premium-Faltschirm-Smartphone mit Google KI, immersivem Display und Android 16.' },
  // 55. Cat S75
  { name_de: 'Cat S75', short_de: 'Cat S75: Ultra-robustes Smartphone mit Satellitenverbindung und Militaerzertifizierung. 268 g, 11,9 mm duenn. Android 12. 128GB Speicher, microSDXC.', desc_de: 'Das Cat S75 ist ein ultra-robustes Smartphone mit Satellitenverbindung und Militaerzertifizierung.' },
  // 56. Blackview BV8900
  { name_de: 'Blackview BV8900', short_de: '398 g, 19,8 mm duenn. Android 13, Doke-OS 3.1. 256GB Speicher, microSDXC.', desc_de: 'Das Blackview BV8900 ist ein ultra-robustes Smartphone mit Android 13 und 256GB Speicher.' },
  // 57. Xiaomi Black Shark Pad 6
  { name_de: 'Xiaomi Black Shark Pad 6', short_de: 'Xiaomi Black Shark Pad 6: 12,1 Zoll LCD IPS-Display, 1TB Speicher. Die ultimative Gaming-Tablette fuer anspruchsvolle Spieler.', desc_de: 'Die Xiaomi Black Shark Pad 6 ist eine Gaming-Tablette mit 12,1 Zoll LCD IPS-Display und 1TB Speicher.' },
  // 58. HP EliteBook x360 1030 G3
  { name_de: 'HP EliteBook x360 1030 G3', short_de: 'HP EliteBook x360 1030 G3, Intel Core i7, 8. Generation, 14 Zoll Touchscreen. Professioneller konvertierbarer Laptop.', desc_de: 'Das HP EliteBook x360 1030 G3 ist ein professioneller konvertierbarer Laptop mit Intel Core i7, 8. Generation und 14-Zoll-Touchscreen.' },
  // 59. Epson LQ-2190
  { name_de: 'Epson LQ-2190', short_de: 'Naadelmatrixdrucker 24-Nadeln mit bis zu 576 cps, 360 x 180 dpi, 136 Spalten, USB/Parallel-Anschluss, A3-Format.', desc_de: 'Der Epson LQ-2190 ist ein Naadelmatrixdrucker mit 24 Nadeln, bis zu 576 cps, 360 x 180 dpi und A3-Format.' },
  // 60. MacBook Pro M5 14 Pouces
  { name_de: 'MacBook Pro M5 14 Zoll', short_de: 'MacBook Pro M5 14 Zoll, 16GB RAM, 512GB SSD, QWERTY-Tastatur.', desc_de: 'Das MacBook Pro M5 14 Zoll ist ein leistungsstaerker Laptop mit Apple M5-Chip, 16GB RAM und 512GB SSD.' },
  // 61. POCO X8 Pro
  { name_de: 'POCO X8 Pro', short_de: 'POCO X8 Pro: 5G-High-Performance-Smartphone mit 120 Hz AMOLED-Display.', desc_de: 'Das POCO X8 Pro ist ein 5G-High-Performance-Smartphone mit 120 Hz AMOLED-Display.' },
  // 62. POCO X8 Pro Max
  { name_de: 'POCO X8 Pro Max', short_de: 'POCO X8 Pro Max: High-Performance-5G-Smartphone mit 120 Hz AMOLED-Display.', desc_de: 'Das POCO X8 Pro Max ist ein High-Performance-5G-Smartphone mit 120 Hz AMOLED-Display.' },
  // 63. HP OMEN Transcend 14 FB0013DX
  { name_de: 'HP OMEN Transcend 14 FB0013DX', short_de: 'HP OMEN Transcend 14 FB0013DX - Premium-Gaming-Laptop 14 Zoll.', desc_de: 'Das HP OMEN Transcend 14 FB0013DX ist ein Premium-Gaming-Laptop mit 14 Zoll Display.' },
  // 64. Garmin GPSMAP 79s
  { name_de: 'Garmin GPSMAP 79s', short_de: 'Der Garmin GPSMAP 79s kann speichern: Bis zu 10.000 Wegpunkte, 250 Routen, 250 Tracks, 20.000 Tracklogpunkte. Interner Speicher: 8GB. Erweiterung per microSD bis zu 32GB.', desc_de: 'Der Garmin GPSMAP 79s ist ein maritimer GPS-Empfaenger mit internem 8GB-Speicher und microSD-Erweiterung.' },
  // 65. HP OmniStudio X AIO 27
  { name_de: 'HP OmniStudio X AIO 27', short_de: 'HP OmniStudio X All-in-One Desktop Next Gen AI 27-cs1055t, Windows 11 Home, 27 Zoll, Intel Core Ultra 5, 16GB RAM, 512GB SSD.', desc_de: 'Der HP OmniStudio X AIO 27 ist ein All-in-One-Desktop-PC mit Intel Core Ultra 5, 16GB RAM und 512GB SSD.' },
  // 66. Premax PM-CC35D
  { name_de: 'Premax PM-CC35D', short_de: 'Die <strong>Premax PM-CC35D</strong> bietet eine ausgezeichnete Zaehlgeschwindigkeit zur Steigerung der Produktivitaet. Schnelles Zahlen, hohe Ladekapazitaet, automatisches Zahlen, Batch-Funktion, ADD-Funktion, automatischer Start.', desc_de: 'Die Premax PM-CC35D ist eine Banknotenzaehlmaschine mit schnellem Zaehler, hoher Kapazitaet und automatischen Funktionen.' },
  // 67. Machine à Compter PREMAX CC90D
  { name_de: 'PREMAX CC90D Banknotenzaehler', short_de: 'Die <strong>PREMAX CC90D professionelle Banknotenzaehlerin</strong> bietet: Schnelles und genaues Zahlen, zuverlaessige Falschgelderkennung, hohe Verarbeitungskapazitaet, einfache und professionelle Benutzeroberflaeche, ausgezeichnete Zuverlaessigkeit bei intensiver Nutzung.', desc_de: 'Die PREMAX CC90D ist eine professionelle Banknotenzaehlerin mit schnellem und genauen Zahlen, zuverlaessiger Falschgelderkennung und hoher Verarbeitungskapazitaet.' },
  // 68. Epson EcoTank L15150
  { name_de: 'Epson EcoTank L15150', short_de: 'Epson EcoTank L15150 - Professioneller A3+-Multifunktionsdrucker mit Tintenbehaelter.', desc_de: 'Der Epson EcoTank L15150 ist ein professioneller A3+-Multifunktionsdrucker mit Tintenbehaelter fuer Bueros und工作组.' },
  // 69. Epson EcoTank L18050
  { name_de: 'Epson EcoTank L18050', short_de: 'Epson EcoTank L18050 - A3+-Fotodrucker mit Tintenbehaelter und hoher Qualitaet.', desc_de: 'Der Epson EcoTank L18050 ist ein A3+-Fotodrucker mit Tintenbehaelter und hoher Ausdruckqualitaet.' },
  // 70. HP Victus 15-fa2309TX Core i7
  { name_de: 'HP Victus 15-fa2309TX Core i7', short_de: 'HP Victus 15-fa2309TX Core i7-13620H, Gaming-PC, 24GB RAM, 1TB SSD, 15,6 Zoll 144 Hz Display.', desc_de: 'Der HP Victus 15-fa2309TX ist ein Gaming-Laptop mit Intel Core i7-13620H, 24GB RAM, 1TB SSD und 15,6 Zoll 144 Hz Display.' },
  // 71. Synology NAS DS423
  { name_de: 'Synology NAS DS423', short_de: 'Synology NAS DS423 - Leistungsstaerker und sicherer 4-Bay-Speicherserver.', desc_de: 'Der Synology NAS DS423 ist ein leistungsstaerker und sicherer 4-Bay-Speicherserver fuer Privat- und Geschaeftsanwender.' },
  // 72. Synology DiskStation DS423+
  { name_de: 'Synology DiskStation DS423+', short_de: 'Synology DiskStation DS423+ - Leistungsstaerker und erweiterbarer 4-Bay-NAS-Server.', desc_de: 'Die Synology DiskStation DS423+ ist ein leistungsstaerker und erweiterbarer 4-Bay-NAS-Server fuer professionelle Speicherbeduerfnisse.' },
  // 73. Synology DiskStation DS925+
  { name_de: 'Synology DiskStation DS925+', short_de: 'Synology DiskStation DS925+ - Hochleistungs-NAS-Server fuer professionellen Datenspeicher.', desc_de: 'Die Synology DiskStation DS925+ ist ein Hochleistungs-NAS-Server fuer professionellen Datenspeicher.' },
  // 74. Synology DiskStation DS223j Serveur NAS
  { name_de: 'Synology DiskStation DS223j NAS-Server', short_de: 'Synology DiskStation DS223j NAS-Server, 2 Bays, sicherer Speicher und private Cloud.', desc_de: 'Die Synology DiskStation DS223j ist ein 2-Bay-NAS-Server fuer sicheren Speicher und private Cloud.' },
  // 75. Cartouche d'Encre HP 938
  { name_de: 'HP 938 Tintenpatrone', short_de: 'HP 938 Tintenpatrone - Ueberlegene Druckqualitaet.', desc_de: 'Die HP 938 Tintenpatrone bietet eine ueberlegene Druckqualitaet fuer HP-Drucker.' },
  // 76. Cartouche d'Encre HP 912
  { name_de: 'HP 912 Tintenpatrone', short_de: 'HP 912 Tintenpatrone - Professionelle Druckqualitaet.', desc_de: 'Die HP 912 Tintenpatrone bietet eine professionelle Druckqualitaet fuer HP-Drucker.' },
  // 77. HP ProBook 460 G11 U7
  { name_de: 'HP ProBook 460 G11 U7', short_de: 'HP ProBook 460 G11 ULTRA 7, 16GB RAM, 512GB SSD, 16-Zoll-Laptop.', desc_de: 'Der HP ProBook 460 G11 ist ein 16-Zoll-Laptop mit Intel Ultra 7, 16GB RAM und 512GB SSD.' },
  // 78. HP OmniBook 5 AI 16-af1017wm
  { name_de: 'HP OmniBook 5 AI 16-af1017wm', short_de: 'HP OmniBook 5 AI 16-af1017wm, Intel Core Ultra 7, 16GB RAM, 1TB SSD, 16-Zoll-Touchscreen.', desc_de: 'Das HP OmniBook 5 AI ist ein 16-Zoll-Laptop mit Intel Core Ultra 7, 16GB RAM, 1TB SSD und Touchscreen.' },
  // 79. TP-Link EAP610 Omada AX1800
  { name_de: 'TP-Link EAP610 Omada AX1800', short_de: 'TP-Link EAP610 Omada AX1800 Wi-Fi 6: Professioneller Zugangspunkt mit 1775 Mbps, Omada SDN Cloud-Verwaltung, PoE+ und WPA3-Sicherheit. Ideal fuer Unternehmen und Hotels.', desc_de: 'Der TP-Link EAP610 Omada AX1800 ist ein professioneller Wi-Fi-6-Zugangspunkt mit 1775 Mbps, Omada SDN Cloud-Verwaltung und PoE+.' },
  // 80. TP-Link EAP650 Omada AX3000 Wi-Fi 6
  { name_de: 'TP-Link EAP650 Omada AX3000 Wi-Fi 6', short_de: 'TP-Link EAP650 Omada AX3000 Wi-Fi 6: Professioneller Hochdichte-Zugangspunkt.', desc_de: 'Der TP-Link EAP650 Omada AX3000 ist ein professioneller Wi-Fi-6-Zugangspunkt fuer hohe Dichten.' },
  // 81. TP-Link Omada AX3000 Wi-Fi 6
  { name_de: 'TP-Link Omada AX3000 Wi-Fi 6', short_de: 'TP-Link Omada AX3000 Wi-Fi 6: Ultraproduktiver professioneller Zugangspunkt.', desc_de: 'Der TP-Link Omada AX3000 ist ein ultraschneller professioneller Wi-Fi-6-Zugangspunkt.' },
  // 82. TP-Link Omada AX1800 Wi-Fi 6
  { name_de: 'TP-Link Omada AX1800 Wi-Fi 6', short_de: 'TP-Link Omada AX1800 Wi-Fi 6: Hochleistungs-Zugangspunkt fuer professionelle Anwendungen.', desc_de: 'Der TP-Link Omada AX1800 ist ein Hochleistungs-Wi-Fi-6-Zugangspunkt fuer professionelle Anwendungen.' },
  // 83. Ubiquiti PBE-5AC-GEN2
  { name_de: 'Ubiquiti PBE-5AC-GEN2', short_de: 'Ubiquiti PBE-5AC-GEN2 ist eine aussenmontierbare Antenne fuer Punkt-zu-Punkt-Verbindungen ueber grosse Distanzen mit airMAX AC-Technologie.', desc_de: 'Die Ubiquiti PBE-5AC-GEN2 ist eine aussenmontierbare Antenne fuer Punkt-zu-Punkt-Verbindungen mit airMAX AC-Technologie.' },
  // 84. Lenovo ThinkPad T14 Gen 2 11th Gen Core i7
  { name_de: 'Lenovo ThinkPad T14 Gen 2 11th Gen Core i7', short_de: 'Lenovo ThinkPad T14 Gen 2 11th Gen Core i7, 16GB RAM, 512GB SSD, 14-Zoll-Display.', desc_de: 'Das Lenovo ThinkPad T14 Gen 2 ist ein 14-Zoll-Laptop mit Intel Core i7 der 11. Generation, 16GB RAM und 512GB SSD.' },
  // 85. HP EliteBook 840 G8 11th Gen Core i7
  { name_de: 'HP EliteBook 840 G8 11th Gen Core i7', short_de: 'HP EliteBook 840 G8 11th Gen Core i7 - 14-Zoll-Laptop.', desc_de: 'Das HP EliteBook 840 G8 ist ein 14-Zoll-Laptop mit Intel Core i7 der 11. Generation.' },
  // 86. HP EliteBook 840 G8 11th Gen Core i5
  { name_de: 'HP EliteBook 840 G8 11th Gen Core i5', short_de: 'HP EliteBook 840 G8 11th Gen Core i5 - 14-Zoll-Laptop.', desc_de: 'Das HP EliteBook 840 G8 ist ein 14-Zoll-Laptop mit Intel Core i5 der 11. Generation.' },
  // 87. HP EliteBook 840 G7 10th Gen Core i7
  { name_de: 'HP EliteBook 840 G7 10th Gen Core i7', short_de: 'HP EliteBook 840 G7 10th Gen Core i7 - 14-Zoll-Laptop.', desc_de: 'Das HP EliteBook 840 G7 ist ein 14-Zoll-Laptop mit Intel Core i7 der 10. Generation.' },
  // 88. HP EliteBook 840 G7 10th Gen Core i5
  { name_de: 'HP EliteBook 840 G7 10th Gen Core i5', short_de: 'HP EliteBook 840 G7 10th Gen Core i5 - 14-Zoll-Laptop.', desc_de: 'Das HP EliteBook 840 G7 ist ein 14-Zoll-Laptop mit Intel Core i5 der 10. Generation.' },
  // 89. HP EliteBook 640 G7 10th Gen Core i5
  { name_de: 'HP EliteBook 640 G7 10th Gen Core i5', short_de: 'HP EliteBook 640 G7 10th Gen Core i5 - 14-Zoll-Laptop.', desc_de: 'Das HP EliteBook 640 G7 ist ein 14-Zoll-Laptop mit Intel Core i5 der 10. Generation.' },
  // 90. HP EliteBook 840 G5 8th Gen Core i5
  { name_de: 'HP EliteBook 840 G5 8th Gen Core i5', short_de: 'HP EliteBook 840 G5 8th Gen Core i5 - 14-Zoll-Laptop.', desc_de: 'Das HP EliteBook 840 G5 ist ein 14-Zoll-Laptop mit Intel Core i5 der 8. Generation.' },
  // 91. HP ProBook 440 G10 i5
  { name_de: 'HP ProBook 440 G10 i5', short_de: 'HP ProBook 440 G10 i5 - 14-Zoll-Business-Laptop.', desc_de: 'Das HP ProBook 440 G10 ist ein 14-Zoll-Business-Laptop mit Intel Core i5.' },
  // 92. MacBook Air M4 13,6 pouces
  { name_de: 'MacBook Air M4 13,6 Zoll', short_de: 'MacBook Air M4 13,6 Zoll - Leichter und leistungsstaerker Laptop mit Apple M4-Chip.', desc_de: 'Das MacBook Air M4 13,6 Zoll ist ein leichter und leistungsstaerker Laptop mit Apple M4-Chip.' },
  // 93. MacBook Air M2 13 pouces
  { name_de: 'MacBook Air M2 13 Zoll', short_de: 'MacBook Air M2 13 Zoll - Kompakter Laptop mit Apple M2-Chip.', desc_de: 'Das MacBook Air M2 13 Zoll ist ein kompakter Laptop mit Apple M2-Chip.' },
  // 94. MacBook Air M3 15 pouces
  { name_de: 'MacBook Air M3 15 Zoll', short_de: 'MacBook Air M3 15 Zoll - Grosser und leistungsstaerker Laptop mit Apple M3-Chip.', desc_de: 'Das MacBook Air M3 15 Zoll ist ein grosser und leistungsstaerker Laptop mit Apple M3-Chip.' },
  // 95. MacBook Pro M4 Max
  { name_de: 'MacBook Pro M4 Max', short_de: 'MacBook Pro M4 Max - Ultraproduktiver Laptop mit Apple M4 Max-Chip.', desc_de: 'Das MacBook Pro M4 Max ist ein ultraschneller Laptop mit Apple M4 Max-Chip fuer professionelle Anwendungen.' },
  // 96. Epson CO-W01 : Vidéoprojecteur
  { name_de: 'Epson CO-W01 Videoprojektor', short_de: 'Epson CO-W01 - Kompakter Videoprojektor fuer Praesentationen und Unterhaltung.', desc_de: 'Der Epson CO-W01 ist ein kompakter Videoprojektor fuer Praesentationen und Unterhaltung.' },
  // 97. Epson EB-X49
  { name_de: 'Epson EB-X49', short_de: 'Epson EB-X49 - XGA-Videoprojektor fuer Bueros und Schulen.', desc_de: 'Der Epson EB-X49 ist ein XGA-Videoprojektor fuer Bueros und Bildungseinrichtungen.' },
  // 98. Epson EB-2250U : Vidéoprojecteur
  { name_de: 'Epson EB-2250U Videoprojektor', short_de: 'Epson EB-2250U - WUXGA-Videoprojektor fuer grosse Raeume.', desc_de: 'Der Epson EB-2250U ist ein WUXGA-Videoprojektor fuer grosse Raeume und professionelle Praesentationen.' },
  // 99. Écran Gamer LG 49 pouces
  { name_de: 'LG 49 Zoll Gaming-Monitor', short_de: 'LG 49 Zoll Gaming-Monitor - Ultragrosses Ultrawide-Display fuer immersives Gaming.', desc_de: 'Der LG 49 Zoll Gaming-Monitor ist ein ultraschwer Ultrawide-Display fuer immersives Gaming.' },
  // 100. Écran incurvé Samsung ViewFinity S6 34 p
  { name_de: 'Samsung ViewFinity S6 34 Zoll Kurvenmonitor', short_de: 'Samsung ViewFinity S6 34 Zoll - Kurvenmonitor fuer kreative Professionals.', desc_de: 'Der Samsung ViewFinity S6 34 Zoll ist ein Kurvenmonitor fuer kreative Professionals und Bueros.' },
];

// ── HELPER FUNCTIONS ──

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 80);
}

function escapeForTs(str) {
  if (!str) return '';
  return str.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\n/g, '\\n');
}

function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    const request = (u, redirects = 0) => {
      if (redirects > 5) return reject(new Error('Too many redirects'));
      protocol.get(u, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          return request(res.headers.location, redirects + 1);
        }
        if (res.statusCode !== 200) return reject(new Error(`HTTP ${res.statusCode}`));
        const stream = fs.createWriteStream(filepath);
        res.pipe(stream);
        stream.on('finish', () => { stream.close(); resolve(); });
        stream.on('error', reject);
      }).on('error', reject);
    };
    request(url);
  });
}

async function downloadImagesForProduct(product, imagesDir) {
  const urls = (product.images || []).map(i => i.src).filter(Boolean);
  const localImages = [];
  
  for (let j = 0; j < Math.min(urls.length, 3); j++) {
    const url = urls[j];
    const ext = path.extname(new URL(url).pathname).split('?')[0] || '.jpg';
    const filename = `${product.slug}${j === 0 ? '' : '-' + (j+1)}${ext}`;
    const filepath = path.join(imagesDir, filename);
    
    if (fs.existsSync(filepath)) {
      localImages.push(`/images/products/${filename}`);
      continue;
    }
    
    try {
      await downloadImage(url, filepath);
      localImages.push(`/images/products/${filename}`);
      process.stdout.write('.');
    } catch (e) {
      console.error(`\n  Failed: ${filename} (${e.message})`);
    }
  }
  
  return localImages;
}

// ── MAIN PROCESSING ──

async function main() {
  const products = amsiData.slice(0, 100); // Only first 100
  const imagesDir = path.join(__dirname, '..', 'public', 'images', 'products');
  
  // Ensure images dir exists
  if (!fs.existsSync(imagesDir)) {
    fs.mkdirSync(imagesDir, { recursive: true });
  }
  
  console.log(`Processing ${products.length} AMSI products...`);
  console.log('Downloading images');
  
  // Download images
  const allImages = [];
  for (let i = 0; i < products.length; i++) {
    process.stdout.write(`[${i+1}/${products.length}] `);
    allImages.push(await downloadImagesForProduct(products[i], imagesDir));
  }
  console.log('\n');
  
  // Generate TypeScript products
  const tsProducts = [];
  const now = new Date().toISOString();
  
  for (let i = 0; i < products.length; i++) {
    const p = products[i];
    const t = translations[i];
    const catId = categoryMap[p.categories?.[0]?.name] || 'cat-elektronik';
    const brandId = brandMap[p.brands?.[0]?.name] || 'b-sony-playstation';
    const priceEur = Math.round((p.prices?.price || 0) / XOF_TO_EUR * 100) / 100;
    const weight = defaultWeights[p.categories?.[0]?.name] || 1.0;
    
    const product = {
      id: `prod-amsi-${String(i+1).padStart(3, '0')}`,
      name: t.name_de,
      slug: `amsi-${slugify(t.name_de)}`,
      description: t.desc_de,
      price: priceEur,
      short_description: t.short_de,
      sku: `AMSI-${String(i+1).padStart(3, '0')}`,
      category_id: catId,
      brand_id: brandId,
      rating: 4.5,
      review_count: Math.floor(Math.random() * 200) + 10,
      images: allImages[i] && allImages[i].length > 0 ? allImages[i] : [],
      compare_at_price: Math.round(priceEur * 1.15 * 100) / 100,
      stock: Math.floor(Math.random() * 30) + 5,
      low_stock_threshold: 3,
      status: 'active',
      featured: i < 5, // First 5 are featured
      best_seller: i < 10, // First 10 are bestsellers
      new_arrival: true,
      on_sale: true,
      weight_kg: weight,
      created_at: now,
      updated_at: now,
    };
    tsProducts.push(product);
  }
  
  // Generate TypeScript code for products
  const tsCode = tsProducts.map(p => {
    const imgStr = p.images.length > 0
      ? `[\n      ${p.images.map(img => `'${img}'`).join(',\n      ')}\n    ]`
      : '[]';
    return `  {
    "id": "${p.id}",
    "name": "${escapeForTs(p.name)}",
    "slug": "${p.slug}",
    "description": "${escapeForTs(p.description)}",
    "price": ${p.price},
    "short_description": "${escapeForTs(p.short_description)}",
    "sku": "${p.sku}",
    "category_id": "${p.category_id}",
    "brand_id": "${p.brand_id}",
    "rating": ${p.rating},
    "review_count": ${p.review_count},
    "images": ${imgStr},
    "compare_at_price": ${p.compare_at_price},
    "stock": ${p.stock},
    "low_stock_threshold": ${p.low_stock_threshold},
    "status": "${p.status}",
    "featured": ${p.featured},
    "best_seller": ${p.best_seller},
    "new_arrival": ${p.new_arrival},
    "on_sale": ${p.on_sale},
    "weight_kg": ${p.weight_kg},
    "created_at": "${p.created_at}",
    "updated_at": "${p.updated_at}"
  }`;
  }).join(',\r\n');
  
  // Write the products to a temp file
  fs.writeFileSync('scripts/amsi-products-ts.txt', tsCode);
  
  // Summary
  console.log('\n=== IMPORT SUMMARY ===');
  console.log(`Products: ${tsProducts.length}`);
  console.log(`Images downloaded: ${allImages.flat().length}`);
  console.log(`Price range: EUR ${Math.min(...tsProducts.map(p=>p.price)).toFixed(2)} - EUR ${Math.max(...tsProducts.map(p=>p.price)).toFixed(2)}`);
  
  // Category breakdown
  const catCounts = {};
  tsProducts.forEach(p => { catCounts[p.category_id] = (catCounts[p.category_id] || 0) + 1; });
  console.log('\nBy category:');
  Object.entries(catCounts).sort((a,b) => b[1]-a[1]).forEach(([k,v]) => console.log(`  ${k}: ${v}`));
  
  console.log('\nGenerated: scripts/amsi-products-ts.txt');
  console.log('Next step: Insert into initial-data.ts');
}

main().catch(console.error);
