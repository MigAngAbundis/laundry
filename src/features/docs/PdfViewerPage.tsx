// src/features/docs/PdfViewerPage.tsx
import React, { useState, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Importar componentes de PrimeReact
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Toolbar } from 'primereact/toolbar';
import { Dropdown } from 'primereact/dropdown';
import { Card } from 'primereact/card';

// Redux
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { fetchPosts, selectAllPosts } from '../posts/postsSlice';
import { LaundryTicket } from '../posts/types';

// En Vite, los archivos en public/ se sirven desde la raíz
// Por ahora todos los tickets usan el mismo PDF de ejemplo
const samplePdf = '/assets/laundry-ticket.pdf'; 

// Configuración del Worker (¡importante!)
// Usar el worker local desde public/
pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';

export const PdfViewerPage = () => {
  const dispatch = useAppDispatch();
  const tickets = useAppSelector(selectAllPosts);
  const { status } = useAppSelector((state) => state.posts);

  const [selectedTicket, setSelectedTicket] = useState<LaundryTicket | null>(null);
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [zoom, setZoom] = useState<number>(1.0);
  const [pageInput, setPageInput] = useState<string>('1');

  // Cargar tickets al montar el componente
  useEffect(() => {
    if (tickets.length === 0) {
      dispatch(fetchPosts({ limit: 100, skip: 0 }));
    }
  }, [dispatch, tickets.length]);

  // Resetear estado del PDF cuando se cambia el ticket
  useEffect(() => {
    if (selectedTicket) {
      setPageNumber(1);
      setPageInput('1');
      setNumPages(0);
      setZoom(1.0);
    }
  }, [selectedTicket]);

  // Preparar opciones para el dropdown
  const ticketOptions = tickets.map(ticket => ({
    label: `Ticket #${ticket.id} - ${ticket.title}`,
    value: ticket,
  }));

  function onDocumentLoadSuccess({ numPages }: { numPages: number }): void {
    setNumPages(numPages);
    setPageNumber(1);
    setPageInput('1');
  }

  const goToPrevPage = () => {
    const newPage = Math.max(pageNumber - 1, 1);
    setPageNumber(newPage);
    setPageInput(String(newPage));
  };

  const goToNextPage = () => {
    const newPage = Math.min(pageNumber + 1, numPages);
    setPageNumber(newPage);
    setPageInput(String(newPage));
  };

  const handleZoomIn = () => setZoom(prevZoom => Math.min(prevZoom + 0.2, 3.0));
  const handleZoomOut = () => setZoom(prevZoom => Math.max(prevZoom - 0.2, 0.5));
  
  const handlePageInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPageInput(e.target.value);
  };
  
  const handlePageInputSubmit = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      let newPage = parseInt(pageInput, 10);
      if (newPage >= 1 && newPage <= numPages) {
        setPageNumber(newPage);
      } else {
        // Reset al valor actual si es inválido
        setPageInput(String(pageNumber));
      }
    }
  };

  const pdfControls = (
    <React.Fragment>
      <div className="p-toolbar-group-left">
        <Button 
          icon="pi pi-angle-left" 
          className="p-button-text" 
          onClick={goToPrevPage} 
          disabled={pageNumber <= 1 || !selectedTicket} 
        />
        <span className="p-input-icon-right" style={{ width: '5em' }}>
           <InputText 
             value={pageInput} 
             onChange={handlePageInputChange} 
             onKeyDown={handlePageInputSubmit} 
             style={{ width: '100%' }}
             disabled={!selectedTicket}
           />
           <span> / {numPages}</span>
        </span>
        <Button 
          icon="pi pi-angle-right" 
          className="p-button-text" 
          onClick={goToNextPage} 
          disabled={pageNumber >= numPages || !selectedTicket} 
        />
      </div>
      <div className="p-toolbar-group-right">
        <Button 
          icon="pi pi-search-minus" 
          className="p-button-text" 
          onClick={handleZoomOut} 
          disabled={zoom <= 0.5 || !selectedTicket} 
        />
        <span className="mx-2">{(zoom * 100).toFixed(0)}%</span>
        <Button 
          icon="pi pi-search-plus" 
          className="p-button-text" 
          onClick={handleZoomIn} 
          disabled={zoom >= 3.0 || !selectedTicket} 
        />
        
        {/* Botón de Descarga */}
        {selectedTicket && (
          <a 
            href={samplePdf} 
            download={`Ticket_${selectedTicket.id}_${selectedTicket.title.replace(/\s+/g, '_')}.pdf`} 
            style={{ textDecoration: 'none' }}
          >
            <Button icon="pi pi-download" className="p-button-text" />
          </a>
        )}
      </div>
    </React.Fragment>
  );

  return (
    <div className="pdf-viewer-container" style={{ display: 'flex', flexDirection: 'column', height: '90vh' }}>
      {/* Selector de Ticket */}
      <Card className="mb-3">
        <div className="flex flex-column gap-3">
          <div className="flex align-items-center gap-2">
            <label htmlFor="ticket-select" className="font-semibold" style={{ minWidth: '150px' }}>
              Seleccionar Ticket:
            </label>
            <Dropdown
              id="ticket-select"
              value={selectedTicket}
              options={ticketOptions}
              onChange={(e) => setSelectedTicket(e.value)}
              placeholder="Seleccione un ticket para ver su PDF"
              className="flex-1"
              loading={status === 'loading'}
              filter
              filterBy="label"
              showClear
            />
          </div>
          {selectedTicket && (
            <div className="flex gap-3 text-sm text-color-secondary">
              <span><strong>ID:</strong> {selectedTicket.id}</span>
              <span><strong>Título:</strong> {selectedTicket.title}</span>
              <span><strong>Estado:</strong> {selectedTicket.status}</span>
              <span><strong>Recibido:</strong> {new Date(selectedTicket.dateReceived).toLocaleDateString()}</span>
            </div>
          )}
        </div>
      </Card>

      {/* Controles del PDF */}
      <Toolbar start={pdfControls} style={{ position: 'sticky', top: 0, zIndex: 1, marginBottom: '1rem' }} />
      
      {/* Visualizador de PDF */}
      <div className="pdf-document-wrapper" style={{ flexGrow: 1, overflow: 'auto', background: '#f0f0f0', padding: '1rem' }}>
        {!selectedTicket ? (
          <div className="flex align-items-center justify-content-center" style={{ minHeight: '400px' }}>
            <div className="text-center">
              <i className="pi pi-file-pdf" style={{ fontSize: '4rem', color: 'var(--text-color-secondary)' }}></i>
              <p className="mt-3 text-lg">Seleccione un ticket para ver su PDF</p>
              <p className="text-sm text-color-secondary mt-2">Use el selector de arriba para elegir un ticket</p>
            </div>
          </div>
        ) : (
          <Document
            file={samplePdf}
            onLoadSuccess={onDocumentLoadSuccess}
            loading={
              <div className="flex align-items-center justify-content-center" style={{ minHeight: '400px' }}>
                <div className="text-center">
                  <i className="pi pi-spin pi-spinner" style={{ fontSize: '2rem' }}></i>
                  <p className="mt-3">Cargando PDF del ticket #{selectedTicket.id}...</p>
                </div>
              </div>
            }
            error={
              <div className="flex align-items-center justify-content-center" style={{ minHeight: '400px' }}>
                <div className="text-center">
                  <i className="pi pi-exclamation-triangle" style={{ fontSize: '2rem', color: 'var(--red-500)' }}></i>
                  <p className="mt-3">Error al cargar el PDF.</p>
                  <p className="text-sm text-color-secondary mt-2">Verifica la consola para más detalles.</p>
                </div>
              </div>
            }
          >
            {numPages > 0 && (
              <Page 
                pageNumber={pageNumber} 
                scale={zoom} 
                renderTextLayer={true} 
                renderAnnotationLayer={true}
              />
            )}
          </Document>
        )}
      </div>
    </div>
  );
};