import React, { useEffect, useRef } from 'react';
import JsBarcode from 'jsbarcode';

interface ProductLabelPrintProps {
  productCode: string;
  productName: string;
  onClose: () => void;
}

export const ProductLabelPrint: React.FC<ProductLabelPrintProps> = ({ productCode, productName, onClose }) => {
  const barcodeRef = useRef<SVGSVGElement>(null);
  const onCloseRef = useRef(onClose);
  const printTriggeredRef = useRef(false);
  const [barcodeReady, setBarcodeReady] = React.useState(false);
  const barcodeValue = productCode.trim().toUpperCase();

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (barcodeRef.current && barcodeValue) {
      try {
        JsBarcode(barcodeRef.current, barcodeValue, {
          format: 'CODE39',
          width: 1,
          height: 30,
          displayValue: false,
          margin: 2
        });
        setBarcodeReady(true);
      } catch (error) {
        console.error('Barcode oluşturma hatası:', error);
        onCloseRef.current();
      }
    }
  }, [barcodeValue]);

  useEffect(() => {
    // Barcode oluşturulduktan sonra yazdır (yalnızca bir kez)
    if (!barcodeReady || !barcodeRef.current || printTriggeredRef.current) return;

    const timer = setTimeout(() => {
      if (printTriggeredRef.current) return;
      printTriggeredRef.current = true;

      let barcodeSvg = '';
      if (barcodeRef.current) {
        barcodeSvg = barcodeRef.current.outerHTML;
      }

      if (!barcodeSvg) {
        console.error('Barcode SVG boş!');
        onCloseRef.current();
        return;
      }

      const printWindow = window.open('', '_blank', 'width=800,height=600');
      if (printWindow) {
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>Etiket Yazdır</title>
              <style>
                @page {
                  size: landscape;
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
                  box-sizing: border-box;
                }
                .label-main {
                  display: flex;
                  flex: 1;
                  min-height: 0;
                  gap: 1.5mm;
                }
                .label-left {
                  flex: 1;
                  min-width: 0;
                  display: flex;
                  flex-direction: column;
                  justify-content: space-between;
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
                  width: 22mm;
                  flex-shrink: 0;
                  display: flex;
                  flex-direction: column;
                  align-items: flex-end;
                  justify-content: flex-start;
                }
                .label-logo {
                  width: 10mm;
                  height: 10mm;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  margin-bottom: 0.5mm;
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
                .qr-container {
                  width: 18mm;
                  height: 18mm;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  margin-top: auto;
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
                  width: 100%;
                  max-width: 100%;
                  margin-top: 1mm;
                  padding-left: 4mm;
                }
                .barcode-block {
                  display: inline-flex;
                  flex-direction: column;
                  align-items: center;
                  max-width: calc(100% - 4mm);
                }
                .barcode-container {
                  display: flex;
                  justify-content: center;
                  align-items: flex-start;
                  max-height: 14mm;
                  overflow: hidden;
                }
                .barcode-svg {
                  width: auto;
                  max-width: 100%;
                  max-height: 14mm;
                  height: auto;
                  display: block;
                }
                .barcode-number {
                  font-size: 9pt;
                  font-weight: bold;
                  text-align: center;
                  font-family: 'Courier New', monospace;
                  margin-top: 0.5mm;
                  width: 100%;
                }
              </style>
            </head>
            <body>
              <div class="label-content">
                <div class="label-main">
                  <div class="label-left">
                    <div class="label-text-section">
                      <div class="label-title">ANABİLİM EĞİTİM KURUMLARI</div>
                      <div class="label-subtitle">BİLGİ İŞLEM BİRİMİ</div>
                      <div class="label-subtitle">EKİPMANLARI</div>
                    </div>
                    <div class="label-barcode-section">
                      <div class="barcode-block">
                        <div class="barcode-container">
                          ${barcodeSvg}
                        </div>
                        <div class="barcode-number">${barcodeValue}</div>
                      </div>
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
              </div>
              <script>
                window.onload = function() {
                  setTimeout(function() {
                    window.print();
                  }, 200);
                };
              </script>
            </body>
          </html>
        `);
        printWindow.document.close();
        // State'i temizle; aksi halde parent re-render'da yazdırma tekrar tetiklenir
        onCloseRef.current();
      } else {
        window.print();
        setTimeout(() => {
          onCloseRef.current();
        }, 500);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [barcodeValue, barcodeReady]);

  // productName şu an etikette kullanılmıyor; prop imzası korunuyor
  void productName;

  return (
    <>
      <div className="print-container">
        <div className="label-content">
          <div className="label-main">
            <div className="label-left">
              <div className="label-text-section">
                <div className="label-title">ANABİLİM EĞİTİM KURUMLARI</div>
                <div className="label-subtitle">BİLGİ İŞLEM BİRİMİ</div>
                <div className="label-subtitle">EKİPMANLARI</div>
              </div>
              <div className="label-barcode-section">
                <div className="barcode-block">
                  <div className="barcode-container">
                    <svg ref={barcodeRef} className="barcode-svg"></svg>
                  </div>
                  <div className="barcode-number">{barcodeValue}</div>
                </div>
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
        </div>
      </div>

      <style>{`
        @page {
          size: landscape;
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

        .label-main {
          display: flex;
          flex: 1;
          min-height: 0;
          gap: 1.5mm;
        }

        .label-left {
          flex: 1;
          min-width: 0;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
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
          width: 22mm;
          flex-shrink: 0;
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          justify-content: flex-start;
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
          width: 18mm;
          height: 18mm;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-top: auto;
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
          width: 100%;
          max-width: 100%;
          margin-top: 1mm;
          padding-left: 4mm;
        }

        .barcode-block {
          display: inline-flex;
          flex-direction: column;
          align-items: center;
          max-width: calc(100% - 4mm);
        }

        .barcode-container {
          display: flex;
          justify-content: center;
          align-items: flex-start;
          max-height: 14mm;
          overflow: hidden;
        }

        .barcode-svg {
          width: auto;
          max-width: 100%;
          max-height: 14mm;
          height: auto;
          display: block;
        }

        .barcode-number {
          font-size: 9pt;
          font-weight: bold;
          text-align: center;
          font-family: 'Courier New', monospace;
          margin-top: 0.5mm;
          width: 100%;
        }
      `}</style>
    </>
  );
};
