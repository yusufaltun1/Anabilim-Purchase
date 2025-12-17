import React, { useEffect, useRef } from 'react';
import JsBarcode from 'jsbarcode';

interface ProductLabelPrintProps {
  productId: number;
  productName: string;
  onClose: () => void;
}

export const ProductLabelPrint: React.FC<ProductLabelPrintProps> = ({ productId, productName, onClose }) => {
  const barcodeRef = useRef<SVGSVGElement>(null);
  const [barcodeReady, setBarcodeReady] = React.useState(false);

  useEffect(() => {
    if (barcodeRef.current) {
      try {
        // Code 39 formatında barcode oluştur
        JsBarcode(barcodeRef.current, productId.toString(), {
          format: 'CODE39',
          width: 1,
          height: 30,
          displayValue: true,
          fontSize: 10,
          margin: 2
        });
        setBarcodeReady(true);
      } catch (error) {
        console.error('Barcode oluşturma hatası:', error);
      }
    }
  }, [productId]);

  useEffect(() => {
    // Barcode oluşturulduktan sonra yazdır
    if (!barcodeReady || !barcodeRef.current) return;

    const timer = setTimeout(() => {
      // Barcode SVG'yi al - SVG içeriğini kontrol et
      let barcodeSvg = '';
      if (barcodeRef.current) {
        barcodeSvg = barcodeRef.current.outerHTML;
        console.log('Barcode SVG:', barcodeSvg);
      }
      
      if (!barcodeSvg) {
        console.error('Barcode SVG boş!');
        onClose();
        return;
      }
      
      // Print için yeni bir pencere aç
      const printWindow = window.open('', '_blank', 'width=300,height=160');
      if (printWindow) {
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>Etiket Yazdır</title>
              <style>
                @page {
                  size: 75mm 40mm;
                  margin: 0;
                }
                * {
                  margin: 0;
                  padding: 0;
                  box-sizing: border-box;
                }
                html, body {
                  width: 75mm;
                  height: 40mm;
                  margin: 0;
                  padding: 0;
                  overflow: hidden;
                }
                .label-content {
                  width: 75mm;
                  height: 40mm;
                  border: 1px solid #000;
                  padding: 1mm;
                  font-family: Arial, sans-serif;
                  background: white;
                  display: flex;
                  flex-direction: column;
                }
                .label-top-section {
                  display: flex;
                  justify-content: space-between;
                  align-items: flex-start;
                  margin-bottom: 0.5mm;
                }
                .label-left {
                  flex: 1;
                }
                .label-text-section {
                  display: flex;
                  flex-direction: column;
                  align-items: center;
                  text-align: center;
                  margin-top: 20px
                }
                .label-title {
                  font-size: 7pt;
                  font-weight: bold;
                  text-transform: uppercase;
                  margin-bottom: 0.3mm;
                  line-height: 1.1;
                }
                .label-subtitle {
                  font-size: 6pt;
                  text-transform: uppercase;
                  margin-bottom: 0.2mm;
                  line-height: 1.1;
                }
                .label-right {
                  display: flex;
                  flex-direction: column;
                  align-items: flex-end;
                }
                .label-logo {
                  width: 10mm;
                  height: 10mm;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  margin-bottom: 0.5mm;
                  margin-right: 17px;
                }
                .logo-image {
                  width: 100%;
                  height: 100%;
                  object-fit: contain;
                }
                .label-contact {
                  display: flex;
                  flex-direction: column;
                  align-items: flex-end;
                  font-size: 5.5pt;
                  line-height: 1.2;
                  margin-bottom: 0.5mm;
                  margin-right: 12px;
                }
                .label-phone {
                  margin-bottom: 0.1mm;
                }
                .qr-container {
                  width: 20mm;
                  height: 20mm;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                }
                .qr-image {
                  width: 100%;
                  height: 100%;
                  object-fit: contain;
                }
                .label-barcode-section {
                  display: flex;
                  flex-direction: column;
                  align-items: flex-start;
                  margin-top: -57px;
                  padding-left: 65px;
                }
                .barcode-container {
                  width: 100%;
                  display: flex;
                  justify-content: flex-start;
                  align-items: flex-start;
                  max-height: 15mm;
                }
                .barcode-svg {
                  width: auto;
                  max-width: 100%;
                  max-height: 15mm;
                  height: auto;
                  display: block;
                }
                .barcode-number {
                  font-size: 9pt;
                  font-weight: bold;
                  text-align: center;
                  font-family: 'Courier New', monospace;
                  margin-top: 1mm;
                  margin-left: 10px
                }
                img {
                  image-resolution: 203dpi;
                }
              </style>
            </head>
            <body>
              <div class="label-content">
                <div class="label-top-section">
                  <div class="label-left">
                    <div class="label-text-section">
                      <div class="label-title">ANABİLİM EĞİTİM KURUMLARI</div>
                      <div class="label-subtitle">BİLGİ İŞLEM BİRİMİ</div>
                      <div class="label-subtitle">EKİPMANLARI</div>
                    </div>
                  </div>
                  <div class="label-right">
                    <div class="label-logo">
                      <img src="${window.location.origin}/alogo.png" alt="Logo" class="logo-image" />
                    </div>
                    <div class="label-contact">
                      <div class="label-phone">0216 415 00 00</div>
                      <div class="label-website">anabilim.k12.tr</div>
                    </div>
                    <div class="qr-container">
                      <img src="${window.location.origin}/qr.png" alt="QR Code" class="qr-image" />
                    </div>
                  </div>
                </div>
                <div class="label-barcode-section">
                  <div class="barcode-container">
                    ${barcodeSvg}
                  </div>
                  <div class="barcode-number">${productId.toString().padStart(6, '0')}</div>
                </div>
              </div>
              <script>
                window.onload = function() {
                  setTimeout(function() {
                    window.print();
                    // Print window kapanınca ana window açık kalacak
                    window.addEventListener('beforeunload', function() {
                      // Ana window'u kapatma
                    });
                  }, 200);
                };
              </script>
            </body>
          </html>
        `);
        printWindow.document.close();
      } else {
        // Popup blocker varsa normal print kullan
        window.print();
        setTimeout(() => {
          onClose();
        }, 500);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [onClose, productId, barcodeReady]);

  return (
    <>
      <div className="print-container">
        <div className="label-content">
          <div className="label-top-section">
            <div className="label-left">
              <div className="label-text-section">
                <div className="label-title">ANABİLİM EĞİTİM KURUMLARI</div>
                <div className="label-subtitle">BİLGİ İŞLEM BİRİMİ</div>
                <div className="label-subtitle">EKİPMANLARI</div>
              </div>
            </div>
            <div className="label-right">
              <div className="label-logo">
                <img src="/alogo.png" alt="Logo" className="logo-image" />
              </div>
              <div className="label-contact">
                <div className="label-phone">0216 415 00 00</div>
                <div className="label-website">anabilim.k12.tr</div>
              </div>
              <div className="qr-container">
                <img src="/qr.png" alt="QR Code" className="qr-image" />
              </div>
            </div>
          </div>
          <div className="label-barcode-section">
            <div className="barcode-container">
              <svg ref={barcodeRef} className="barcode-svg"></svg>
            </div>
            <div className="barcode-number">{productId.toString().padStart(6, '0')}</div>
          </div>
        </div>
      </div>

      <style>{`
        @page {
          size: 75mm 40mm;
          margin: 0;
        }

        @media print {
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          html, body {
            width: 75mm;
            height: 40mm;
            margin: 0;
            padding: 0;
            overflow: hidden;
          }
          
          body * {
            visibility: hidden !important;
          }
          
          .print-container {
            visibility: visible !important;
            position: fixed;
            left: 0;
            top: 0;
            width: 75mm;
            height: 40mm;
            margin: 0;
            padding: 0;
            page-break-after: avoid;
            page-break-inside: avoid;
          }
          
          .print-container * {
            visibility: visible !important;
          }
          
          img {
            image-resolution: 203dpi;
          }
        }

        @media screen {
          .print-container {
            display: none;
          }
        }

        .label-content {
          width: 75mm;
          height: 40mm;
          border: 1px solid #000;
          padding: 1mm;
          font-family: Arial, sans-serif;
          background: white;
          display: flex;
          flex-direction: column;
          box-sizing: border-box;
        }

        .label-top-section {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 0.5mm;
        }

        .label-left {
          flex: 1;
        }

        .label-text-section {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
        }

        .label-title {
          font-size: 7pt;
          font-weight: bold;
          text-transform: uppercase;
          margin-bottom: 0.3mm;
          line-height: 1.1;
        }

        .label-subtitle {
          font-size: 6pt;
          text-transform: uppercase;
          margin-bottom: 0.2mm;
          line-height: 1.1;
        }

        .label-right {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
        }

        .label-logo {
          width: 10mm;
          height: 10mm;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 0.5mm;
          margin-right: 0;
        }

        .logo-image {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }

        .label-contact {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          font-size: 5.5pt;
          line-height: 1.2;
          margin-bottom: 0.5mm;
        }

        .label-phone {
          margin-bottom: 0.1mm;
        }

        .qr-container {
          width: 20mm;
          height: 20mm;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .qr-image {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }

        .label-barcode-section {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          margin-top: -57px;
          padding-left: 67px;
        }

        .barcode-container {
          width: 100%;
          display: flex;
          justify-content: center;
          align-items: flex-start;
          max-height: 15mm;
        }

        .barcode-svg {
          width: auto;
          max-width: 100%;
          max-height: 15mm;
          height: auto;
          display: block;
        }

        .barcode-number {
          font-size: 9pt;
          font-weight: bold;
          text-align: center;
          font-family: 'Courier New', monospace;
          margin-top: 1mm;
        }
      `}</style>
    </>
  );
};

