import React, { useEffect, useState } from 'react';
import { getValidations, validateTemplate } from '../../api';
import {
  Page,
  Header,
  Content,
  ContentHeader,
  InfoCard,
  Progress,
} from '@backstage/core-components';
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
  TableHead,
  TextField,
  Button,
  Box,
  Typography,
  Divider,
  Chip,
  useTheme,
  CircularProgress,
  Fade,
  IconButton,
  Tooltip,
} from '@material-ui/core';
import { Alert } from '@material-ui/lab';
import { makeStyles } from '@material-ui/core/styles';
import CodeIcon from '@material-ui/icons/Code';
import AssignmentIcon from '@material-ui/icons/Assignment';
import RefreshIcon from '@material-ui/icons/Refresh';
import ClearIcon from '@material-ui/icons/Clear';

const useStyles = makeStyles(theme => ({
  root: {
    padding: theme.spacing(3),
    backgroundColor: theme.palette.background.default,
    [theme.breakpoints.down('sm')]: {
      padding: theme.spacing(2),
    },
  },
  formCard: {
    padding: theme.spacing(3),
    boxShadow: theme.shadows[3],
    borderRadius: theme.shape.borderRadius,
    backgroundColor: theme.palette.background.paper,
    [theme.breakpoints.down('sm')]: {
      padding: theme.spacing(2),
    },
  },
  tableCard: {
    padding: theme.spacing(2),
    boxShadow: theme.shadows[3],
    borderRadius: theme.shape.borderRadius,
    backgroundColor: theme.palette.background.paper,
    position: 'relative',
    [theme.breakpoints.down('sm')]: {
      padding: theme.spacing(1),
    },
  },
  divider: {
    margin: theme.spacing(2, 0),
  },
  successRow: {
    backgroundColor: '#e6ffe6',
    '&:hover': {
      backgroundColor: '#d6f5d6',
    },
  },
  errorRow: {
    backgroundColor: '#ffe6e6',
    '&:hover': {
      backgroundColor: '#f5d6d6',
    },
  },
  chip: {
    margin: theme.spacing(0.5),
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
  },
  validateButton: {
    transition: 'transform 0.2s ease-in-out',
    '&:hover': {
      transform: 'scale(1.05)',
    },
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  formActions: {
    display: 'flex',
    gap: theme.spacing(2),
    justifyContent: 'center',
    [theme.breakpoints.down('sm')]: {
      flexDirection: 'column',
      alignItems: 'center',
    },
  },
}));

export const TemplateValidatorDashboard = () => {
  const classes = useStyles();
  const theme = useTheme();
  const [validations, setValidations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [tableLoading, setTableLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [yamlContent, setYamlContent] = useState('');
  const [entityRef, setEntityRef] = useState('');
  const [submitStatus, setSubmitStatus] = useState<string | null>(null);

  const fetchValidations = async () => {
    setTableLoading(true);
    setError(null);
    try {
      const data = await getValidations();
      setValidations(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setTableLoading(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    let ws: WebSocket | null = null;
    let reconnectTimeout: NodeJS.Timeout | null = null;

    function connect() {
      ws = new WebSocket('ws://localhost:7007'); // Use the main backend port
      ws.onopen = () => setLoading(false);
      ws.onmessage = event => {
        const message = JSON.parse(event.data);
        if (message.type === 'validation') {
          setValidations(prev => [message.data, ...prev]);
        }
      };
      ws.onerror = () => {
        setError('WebSocket error');
        setLoading(false);
        ws?.close();
      };
      ws.onclose = () => {
        setLoading(false);
        // Try to reconnect after 5 seconds
        reconnectTimeout = setTimeout(connect, 5000);
      };
    }

    connect();
    return () => {
      ws?.close();
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitStatus(null);
    setError(null);
    try {
      await validateTemplate({
        yamlContent: yamlContent || undefined,
        entityRef: entityRef || undefined,
      });
      setSubmitStatus('Validation triggered successfully!');
      setYamlContent('');
      setEntityRef('');
    } catch (e: any) {
      let message = e.message;
      if (e.response && typeof e.response.text === 'function') {
        try {
          const text = await e.response.text();
          message = text;
        } catch {}
      }
      setError(message);
      setSubmitStatus('Validation failed.');
    }
  };

  const handleClear = () => {
    setYamlContent('');
    setEntityRef('');
    setSubmitStatus(null);
    setError(null);
  };

  const handleRefresh = () => {
    fetchValidations();
  };

  return (
    <Page themeId="tool">
      <Header title="Template Validation Dashboard" subtitle="Ensure your Backstage templates meet the required standards" />
      <Content className={classes.root}>
        <ContentHeader title="Validate Your Backstage Templates" />

        {/* Validation Form Section */}
        <Box mb={4}>
          <InfoCard>
            <Box className={classes.formCard}>
              <Box className={classes.header}>
                <CodeIcon color="primary" />
                <Typography variant="h6">Validate a Template</Typography>
              </Box>
              <Divider className={classes.divider} />
              <form onSubmit={handleSubmit}>
                <Box display="flex" flexDirection="column" style={{ gap: 24 }}>
                  <TextField
                    label="YAML Content"
                    multiline
                    minRows={4}
                    value={yamlContent}
                    onChange={e => setYamlContent(e.target.value)}
                    placeholder="Paste catalog-info.yaml here..."
                    variant="outlined"
                    fullWidth
                    InputLabelProps={{
                      style: { fontWeight: 500 },
                    }}
                  />
                  <Typography
                    variant="body2"
                    align="center"
                    color="textSecondary"
                  >
                    or
                  </Typography>
                  <TextField
                    label="Entity Ref"
                    value={entityRef}
                    onChange={e => setEntityRef(e.target.value)}
                    placeholder="component:default/example"
                    variant="outlined"
                    fullWidth
                    InputLabelProps={{
                      style: { fontWeight: 500 },
                    }}
                  />
                  <Box className={classes.formActions}>
                    <Button
                      type="submit"
                      variant="contained"
                      color="primary"
                      size="large"
                      className={classes.validateButton}
                      style={{ padding: theme.spacing(1, 4) }}
                    >
                      Validate
                    </Button>
                    <Button
                      variant="outlined"
                      color="default"
                      size="large"
                      onClick={handleClear}
                      startIcon={<ClearIcon />}
                      style={{ padding: theme.spacing(1, 4) }}
                    >
                      Clear
                    </Button>
                  </Box>
                </Box>
              </form>
              <Fade in={!!submitStatus || !!error}>
                <Box mt={2}>
                  {submitStatus && (
                    <Alert severity="success">{submitStatus}</Alert>
                  )}
                  {error && (
                    <Alert severity="error" style={{ marginTop: 8 }}>
                      {error}
                    </Alert>
                  )}
                </Box>
              </Fade>
            </Box>
          </InfoCard>
        </Box>

        {/* Validation Results Section */}
        <InfoCard>
          <Box className={classes.tableCard}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Box className={classes.header}>
                <AssignmentIcon color="primary" />
                <Typography variant="h6">Recent Validation Results</Typography>
              </Box>
              <Tooltip title="Refresh Results">
                <IconButton onClick={handleRefresh} disabled={tableLoading}>
                  <RefreshIcon />
                </IconButton>
              </Tooltip>
            </Box>
            <Divider className={classes.divider} />
            {loading ? (
              <Progress />
            ) : (
              <>
                {tableLoading && (
                  <Box className={classes.loadingOverlay}>
                    <CircularProgress />
                  </Box>
                )}
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>
                        <Typography variant="subtitle2">Entity Ref</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="subtitle2">Passed</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="subtitle2">Description</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="subtitle2">Tags</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="subtitle2">Owner</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="subtitle2">Webhook Status</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="subtitle2">Errors</Typography>
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {Array.isArray(validations) && validations.length > 0 ? (
                      validations.map((v, i) => (
                        <TableRow
                          key={i}
                          className={
                            v.passed ? classes.successRow : classes.errorRow
                          }
                        >
                          <TableCell>{v.entityRef || 'N/A'}</TableCell>
                          <TableCell>{v.passed ? '✅' : '❌'}</TableCell>
                          <TableCell>{v.description || 'N/A'}</TableCell>
                          <TableCell>
                            {Array.isArray(v.tags) && v.tags.length > 0
                              ? v.tags.map((tag: string, idx: number) => (
                                  <Chip
                                    key={idx}
                                    label={tag}
                                    size="small"
                                    className={classes.chip}
                                    color="primary"
                                    variant="outlined"
                                  />
                                ))
                              : 'None'}
                          </TableCell>
                          <TableCell>{v.owner || 'N/A'}</TableCell>
                          <TableCell>{v.webhookStatus || 'N/A'}</TableCell>
                          <TableCell>
                            {Array.isArray(v.errors) && v.errors.length > 0 ? (
                              <ul style={{ margin: 0, paddingLeft: 16 }}>
                                {v.errors.map((err: string, idx: number) => (
                                  <li key={idx}>{err}</li>
                                ))}
                              </ul>
                            ) : (
                              'None'
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7}>
                          <Typography
                            variant="body2"
                            color="textSecondary"
                            align="center"
                          >
                            No validation results yet.
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </>
            )}
          </Box>
        </InfoCard>
      </Content>
    </Page>
  );
};