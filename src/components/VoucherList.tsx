// Componente VoucherList - MussikOn Admin System
// Muestra una lista de vouchers con opciones de filtrado y visualización

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  Divider
} from '@mui/material';
import {
  FilterList as FilterIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  OpenInNew as OpenInNewIcon,
  Receipt as ReceiptIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
  Close as CloseIcon
} from '@mui/icons-material';

// Importar componentes
import VoucherImage from './VoucherImage';
import ModernButton from './ui/ModernButton';
import ModernInput from './ui/ModernInput';

// Importar estilos
import { buttonStyles } from '../theme/buttonStyles';

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
  createdAt: string;
  updatedAt: string;
}

interface VoucherListProps {
  title?: string;
  showFilters?: boolean;
  maxItems?: number;
  onVoucherClick?: (voucher: VoucherData) => void;
  className?: string;
}

const VoucherList: React.FC<VoucherListProps> = ({
  title = 'Vouchers de Depósitos',
  showFilters = true,
  maxItems = 12,
  onVoucherClick,
  className = ''
}) => {
  const [vouchers, setVouchers] = useState<VoucherData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    dateFrom: '',
    dateTo: ''
  });
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [selectedVoucher, setSelectedVoucher] = useState<VoucherData | null>(null);

  // Cargar vouchers
  const loadVouchers = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/admin/payments/pending-deposits', {
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
        setVouchers(data.data.slice(0, maxItems));
      } else {
        throw new Error(data.error || 'Error cargando vouchers');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      console.error('[VoucherList] Error cargando vouchers:', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Cargar datos al montar el componente
  useEffect(() => {
    loadVouchers();
  }, [maxItems]);

  // Filtrar vouchers
  const filteredVouchers = vouchers.filter(voucher => {
    const matchesSearch = !filters.search ||
      voucher.id.toLowerCase().includes(filters.search.toLowerCase()) ||
      voucher.userId.toLowerCase().includes(filters.search.toLowerCase()) ||
      voucher.voucherFile?.filename?.toLowerCase().includes(filters.search.toLowerCase());

    const matchesStatus = filters.status === 'all' || voucher.status === filters.status;

    const matchesDateFrom = !filters.dateFrom ||
      new Date(voucher.createdAt) >= new Date(filters.dateFrom);

    const matchesDateTo = !filters.dateTo ||
      new Date(voucher.createdAt) <= new Date(filters.dateTo);

    return matchesSearch && matchesStatus && matchesDateFrom && matchesDateTo;
  });

  // Limpiar filtros
  const clearFilters = () => {
    setFilters({
      search: '',
      status: 'all',
      dateFrom: '',
      dateTo: ''
    });
  };

  // Manejar clic en voucher
  const handleVoucherClick = (voucher: VoucherData) => {
    setSelectedVoucher(voucher);
    setShowDetailsDialog(true);
    onVoucherClick?.(voucher);
  };

  // Descargar todos los vouchers
  const downloadAllVouchers = () => {
    filteredVouchers.forEach(voucher => {
      if (voucher.voucherFile?.url) {
        const link = document.createElement('a');
        link.href = voucher.voucherFile.url; // Usar URL directa de S3
        link.download = voucher.voucherFile.filename || `voucher-${voucher.id}.jpg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    });
  };

  // Obtener color del estado
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'verified': return 'success';
      case 'rejected': return 'error';
      default: return 'default';
    }
  };

  // Obtener texto del estado
  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Pendiente';
      case 'verified': return 'Verificado';
      case 'rejected': return 'Rechazado';
      default: return status;
    }
  };

  // Formatear fecha
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Formatear moneda
  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: currency || 'USD'
    }).format(amount);
  };

  return (
    <Box className={className}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 600, display: 'flex', alignItems: 'center' }}>
          <ReceiptIcon sx={{ mr: 1 }} />
          {title}
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <ModernButton
            variant="outline"
            size="sm"
            startIcon={<RefreshIcon />}
            onClick={loadVouchers}
            disabled={loading}
          >
            {loading ? 'Actualizando...' : 'Actualizar'}
          </ModernButton>
          <ModernButton
            variant="secondary"
            size="sm"
            startIcon={<DownloadIcon />}
            onClick={downloadAllVouchers}
            disabled={filteredVouchers.length === 0}
          >
            Descargar Todos
          </ModernButton>
        </Box>
      </Box>

      {/* Filtros */}
      {showFilters && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, display: 'flex', alignItems: 'center' }}>
              <FilterIcon sx={{ mr: 1 }} />
              Filtros de Búsqueda
            </Typography>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={6} md={3}>
                <ModernInput
                  fullWidth
                  size="sm"
                  label="Buscar"
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  startIcon={<SearchIcon />}
                  placeholder="ID, usuario, archivo..."
                />
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <FormControl fullWidth size="small">
                  <InputLabel>Estado</InputLabel>
                  <Select
                    value={filters.status}
                    onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                    label="Estado"
                  >
                    <MenuItem value="all">Todos</MenuItem>
                    <MenuItem value="pending">Pendientes</MenuItem>
                    <MenuItem value="verified">Verificados</MenuItem>
                    <MenuItem value="rejected">Rechazados</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <ModernInput
                  fullWidth
                  size="sm"
                  label="Desde"
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <ModernInput
                  fullWidth
                  size="sm"
                  label="Hasta"
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <ModernButton
                    variant="outline"
                    size="sm"
                    startIcon={<ClearIcon />}
                    onClick={clearFilters}
                    sx={{ flex: 1 }}
                  >
                    Limpiar
                  </ModernButton>
                  <Chip
                    label={`${filteredVouchers.length} resultados`}
                    color="primary"
                    size="small"
                  />
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Estado de carga */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      )}

      {/* Error */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          Error cargando vouchers: {error}
        </Alert>
      )}

      {/* Lista de vouchers */}
      {!loading && !error && (
        <>
          {filteredVouchers.length > 0 ? (
            <Grid container spacing={2}>
              {filteredVouchers.map((voucher) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={voucher.id}>
                  <Card
                    sx={{
                      height: '100%',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: 4
                      }
                    }}
                    onClick={() => handleVoucherClick(voucher)}
                  >
                    <CardContent sx={{ p: 2 }}>
                      {/* Voucher Image */}
                      <Box sx={{ mb: 2, textAlign: 'center' }}>
                        <VoucherImage
                          depositId={voucher.id}
                          size="medium"
                          showPreview={false}
                        />
                      </Box>

                      {/* Información */}
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                          {voucher.id.slice(0, 8)}...
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          Usuario: {voucher.userId.slice(0, 8)}...
                        </Typography>
                        <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'primary.main', mb: 1 }}>
                          {formatCurrency(voucher.amount, voucher.currency)}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <Chip
                            label={getStatusText(voucher.status)}
                            color={getStatusColor(voucher.status) as any}
                            size="small"
                          />
                          <Typography variant="caption" color="text.secondary">
                            {formatDate(voucher.createdAt)}
                          </Typography>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Card sx={{ textAlign: 'center', py: 6 }}>
              <ReceiptIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
                No se encontraron vouchers
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                No hay vouchers que coincidan con los filtros aplicados
              </Typography>
              <ModernButton
                variant="outline"
                onClick={clearFilters}
              >
                Limpiar Filtros
              </ModernButton>
            </Card>
          )}
        </>
      )}

      {/* Diálogo de detalles */}
      <Dialog
        open={showDetailsDialog}
        onClose={() => setShowDetailsDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <ReceiptIcon sx={{ mr: 1 }} />
              Detalles del Voucher
            </Box>
            <IconButton onClick={() => setShowDetailsDialog(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent>
          {selectedVoucher && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>
                  Información del Depósito
                </Typography>
                <List dense>
                  <ListItem>
                    <ListItemText
                      primary="ID de Depósito"
                      secondary={selectedVoucher.id}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Usuario"
                      secondary={selectedVoucher.userId}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Monto"
                      secondary={formatCurrency(selectedVoucher.amount, selectedVoucher.currency)}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Estado"
                      secondary={
                        <Chip
                          label={getStatusText(selectedVoucher.status)}
                          color={getStatusColor(selectedVoucher.status) as any}
                          size="small"
                        />
                      }
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Fecha de Creación"
                      secondary={formatDate(selectedVoucher.createdAt)}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Última Actualización"
                      secondary={formatDate(selectedVoucher.updatedAt)}
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
                      secondary={selectedVoucher.voucherFile?.filename || 'N/A'}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Fecha de subida"
                      secondary={selectedVoucher.voucherFile?.uploadedAt ?
                        formatDate(selectedVoucher.voucherFile.uploadedAt) : 'N/A'
                      }
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Tiene voucher"
                      secondary={selectedVoucher.hasVoucherFile ? 'Sí' : 'No'}
                    />
                  </ListItem>
                </List>

                <Divider sx={{ my: 2 }} />

                <Typography variant="h6" gutterBottom>
                  Vista Previa
                </Typography>
                <Box sx={{ textAlign: 'center' }}>
                  <VoucherImage
                    depositId={selectedVoucher.id}
                    size="large"
                    showPreview={false}
                  />
                </Box>
              </Grid>
            </Grid>
          )}
        </DialogContent>

        <DialogActions>
          {selectedVoucher?.voucherFile?.url && (
            <>
              <Button
                startIcon={<DownloadIcon />}
                onClick={() => {
                  const link = document.createElement('a');
                  link.href = selectedVoucher.voucherFile!.url; // Usar URL directa de S3
                  link.download = selectedVoucher.voucherFile?.filename || `voucher-${selectedVoucher.id}.jpg`;
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                }}
                sx={buttonStyles.secondary}
              >
                Descargar
              </Button>
              <Button
                startIcon={<OpenInNewIcon />}
                onClick={() => selectedVoucher.voucherFile?.url && window.open(selectedVoucher.voucherFile.url, '_blank')}
                sx={buttonStyles.primary}
              >
                Abrir en Nueva Pestaña
              </Button>
            </>
          )}
          <Button
            onClick={() => setShowDetailsDialog(false)}
            sx={buttonStyles.text}
          >
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default VoucherList; 