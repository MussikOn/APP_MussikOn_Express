// Componente VoucherImage - MussikOn Admin System
// Muestra imágenes de vouchers de depósitos con manejo de errores y opciones de visualización

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  CircularProgress,
  IconButton,
  Card,
  CardMedia,
  Chip,
  Grid,
  List,
  ListItem,
  ListItemText
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import {
  ZoomIn as ZoomInIcon,
  Download as DownloadIcon,
  OpenInNew as OpenInNewIcon,
  Error as ErrorIcon,
  Refresh as RefreshIcon,
  Receipt as ReceiptIcon
} from '@mui/icons-material';

// Importar estilos
import { buttonStyles } from '../theme/buttonStyles';

interface VoucherImageProps {
  depositId: string;
  size?: 'small' | 'medium' | 'large';
  showPreview?: boolean;
  className?: string;
  onError?: (error: string) => void;
  onLoad?: () => void;
}

interface VoucherData {
  id: string;
  userId: string;
  amount: number;
  currency: string;
  status: string;
  voucherFile: {
    url: string;
    filename: string;
    uploadedAt: string;
  } | null;
  hasVoucherFile: boolean;
  voucherUrl: string | null;
}

const VoucherImage: React.FC<VoucherImageProps> = ({
  depositId,
  size = 'medium',
  showPreview = true,
  className = '',
  onError,
  onLoad
}) => {
  const [voucherData, setVoucherData] = useState<VoucherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);
  const [showDialog, setShowDialog] = useState(false);

  // Tamaños de imagen
  const imageSizes = {
    small: { width: 120, height: 80 },
    medium: { width: 200, height: 150 },
    large: { width: 300, height: 200 }
  };

  // Cargar datos del voucher
  const loadVoucherData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/admin/payments/deposit-info/${depositId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.success && data.data) {
        setVoucherData(data.data);
        setImageError(false);
        onLoad?.();
      } else {
        throw new Error(data.error || 'Error cargando datos del voucher');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      setImageError(true);
      onError?.(errorMessage);
      console.error('[VoucherImage] Error cargando voucher:', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Cargar datos al montar el componente
  useEffect(() => {
    if (depositId) {
      loadVoucherData();
    }
  }, [depositId]);

  // Manejar error de imagen
  const handleImageError = () => {
    setImageError(true);
    setError('No se pudo cargar la imagen del voucher');
    onError?.('No se pudo cargar la imagen del voucher');
  };

  // Descargar imagen
  const handleDownload = () => {
    if (voucherData?.voucherFile?.url) {
      const link = document.createElement('a');
      link.href = voucherData.voucherFile.url;
      link.download = voucherData.voucherFile.filename || `voucher-${depositId}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  // Abrir en nueva pestaña
  const handleOpenInNewTab = () => {
    if (voucherData?.voucherFile?.url) {
      window.open(voucherData.voucherFile.url, '_blank');
    }
  };

  // Generar URL de imagen - Usar directamente la URL de S3
  const getImageUrl = () => {
    if (!voucherData?.hasVoucherFile || !voucherData?.voucherFile?.url) return null;
    return voucherData.voucherFile.url; // URL directa de S3
  };

  // Renderizar estado de carga
  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          ...imageSizes[size],
          border: '2px dashed',
          borderColor: 'grey.300',
          borderRadius: 2,
          bgcolor: 'grey.50'
        }}
        className={className}
      >
        <CircularProgress size={24} />
        <Typography variant="caption" sx={{ mt: 1, color: 'text.secondary' }}>
          Cargando voucher...
        </Typography>
      </Box>
    );
  }

  // Renderizar error
  if (error || !voucherData?.hasVoucherFile || imageError) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          ...imageSizes[size],
          border: '2px dashed',
          borderColor: 'error.main',
          borderRadius: 2,
          bgcolor: 'error.50'
        }}
        className={className}
      >
        <ErrorIcon sx={{ fontSize: 32, color: 'error.main', mb: 1 }} />
        <Typography variant="caption" sx={{ color: 'error.main', textAlign: 'center' }}>
          {error || 'Voucher no disponible'}
        </Typography>
        <Button
          size="small"
          startIcon={<RefreshIcon />}
          onClick={loadVoucherData}
          sx={{ mt: 1, fontSize: '0.75rem' }}
        >
          Reintentar
        </Button>
      </Box>
    );
  }

  const imageUrl = getImageUrl();

  return (
    <>
      {/* Imagen del voucher */}
      <Card
        sx={{
          width: imageSizes[size].width,
          height: imageSizes[size].height,
          cursor: showPreview ? 'pointer' : 'default',
          transition: 'all 0.3s ease',
          '&:hover': showPreview ? {
            transform: 'scale(1.02)',
            boxShadow: 4
          } : {},
          position: 'relative'
        }}
        className={className}
        onClick={showPreview ? () => setShowDialog(true) : undefined}
      >
        <CardMedia
          component="img"
          image={imageUrl || ''}
          alt={`Voucher de depósito ${depositId}`}
          sx={{
            width: '100%',
            height: '100%',
            objectFit: 'cover'
          }}
          onError={handleImageError}
          onLoad={() => {
            setImageError(false);
            onLoad?.();
          }}
        />

        {/* Overlay con información */}
        <Box
          sx={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
            color: 'white',
            p: 1
          }}
        >
          <Typography variant="caption" sx={{ display: 'block' }}>
            {voucherData.currency} {voucherData.amount}
          </Typography>
          <Typography variant="caption" sx={{ opacity: 0.8 }}>
            {new Date(voucherData.voucherFile?.uploadedAt || '').toLocaleDateString()}
          </Typography>
        </Box>

        {/* Icono de zoom */}
        {showPreview && (
          <Box
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              bgcolor: 'rgba(0,0,0,0.5)',
              borderRadius: '50%',
              p: 0.5
            }}
          >
            <ZoomInIcon sx={{ fontSize: 16, color: 'white' }} />
          </Box>
        )}
      </Card>

      {/* Diálogo de vista previa */}
      <Dialog
        open={showDialog}
        onClose={() => setShowDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <ReceiptIcon sx={{ mr: 1 }} />
              Voucher de Depósito
            </Box>
            <IconButton onClick={() => setShowDialog(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent>
          <Box sx={{ mb: 3 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>
                  Información del Depósito
                </Typography>
                <List dense>
                  <ListItem>
                    <ListItemText
                      primary="ID de Depósito"
                      secondary={voucherData.id}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Usuario"
                      secondary={voucherData.userId}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Monto"
                      secondary={`${voucherData.currency} ${voucherData.amount}`}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Estado"
                      secondary={
                        <Chip
                          label={voucherData.status}
                          color={voucherData.status === 'pending' ? 'warning' : 'success'}
                          size="small"
                        />
                      }
                    />
                  </ListItem>
                </List>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>
                  Archivo del Voucher
                </Typography>
                <List dense>
                  <ListItem>
                    <ListItemText
                      primary="Nombre del archivo"
                      secondary={voucherData.voucherFile?.filename || 'N/A'}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Fecha de subida"
                      secondary={voucherData.voucherFile?.uploadedAt ?
                        new Date(voucherData.voucherFile.uploadedAt).toLocaleString() : 'N/A'
                      }
                    />
                  </ListItem>
                </List>
              </Grid>
            </Grid>
          </Box>

          {/* Imagen en tamaño completo */}
          <Box sx={{ textAlign: 'center' }}>
            <img
              src={imageUrl || ''}
              alt={`Voucher de depósito ${depositId}`}
              style={{
                maxWidth: '100%',
                maxHeight: '400px',
                objectFit: 'contain',
                borderRadius: 8
              }}
              onError={handleImageError}
            />
          </Box>
        </DialogContent>

        <DialogActions>
          <Button
            startIcon={<DownloadIcon />}
            onClick={handleDownload}
            sx={buttonStyles.secondary}
          >
            Descargar
          </Button>
          <Button
            startIcon={<OpenInNewIcon />}
            onClick={handleOpenInNewTab}
            sx={buttonStyles.primary}
          >
            Abrir en Nueva Pestaña
          </Button>
          <Button
            onClick={() => setShowDialog(false)}
            sx={buttonStyles.text}
          >
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default VoucherImage; 