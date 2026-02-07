import { useState, useMemo } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import TextField from '@/components/mui/TextField';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import AddPhotoAlternate from '@mui/icons-material/AddPhotoAlternate';
import { ICON_REGISTRY, ICON_MAP, ICON_CATEGORIES } from './iconRegistry';

interface IconPickerProps {
  value: string | null;
  onChange: (name: string | null) => void;
}

export default function IconPicker({ value, onChange }: IconPickerProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    if (!search) return ICON_REGISTRY;
    const q = search.toLowerCase();
    return ICON_REGISTRY.filter(
      (e) =>
        e.label.toLowerCase().includes(q) || e.name.toLowerCase().includes(q),
    );
  }, [search]);

  const grouped = useMemo(() => {
    if (search) return null;
    const groups: Record<string, typeof ICON_REGISTRY> = {};
    for (const category of ICON_CATEGORIES) {
      const items = filtered.filter((e) => e.category === category);
      if (items.length > 0) groups[category] = items;
    }
    return groups;
  }, [filtered, search]);

  const handleSelect = (name: string) => {
    onChange(name);
    setOpen(false);
    setSearch('');
  };

  const handleClear = () => {
    onChange(null);
    setOpen(false);
    setSearch('');
  };

  const handleClose = () => {
    setOpen(false);
    setSearch('');
  };

  const SelectedIcon = value ? ICON_MAP[value] : null;

  return (
    <>
      <Tooltip title={value ?? ''} enterDelay={500}>
        <IconButton
          onClick={() => setOpen(true)}
          sx={{ alignSelf: 'flex-start' }}
        >
          {SelectedIcon ? <SelectedIcon /> : <AddPhotoAlternate />}
        </IconButton>
      </Tooltip>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>Choose an Icon</DialogTitle>
        <DialogContent>
          <TextField
            placeholder="Search icons..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            fullWidth
            size="small"
            autoFocus
            sx={{ mb: 2 }}
          />

          <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
            {grouped ? (
              ICON_CATEGORIES.map((category) => {
                const items = grouped[category];
                if (!items) return null;
                return (
                  <Box key={category} sx={{ mb: 2 }}>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ mb: 0.5, display: 'block' }}
                    >
                      {category}
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {items.map((entry) => (
                        <IconButton
                          key={entry.name}
                          onClick={() => handleSelect(entry.name)}
                          title={entry.label}
                          sx={{
                            border: '1px solid',
                            borderColor:
                              value === entry.name
                                ? 'primary.main'
                                : 'transparent',
                            bgcolor:
                              value === entry.name
                                ? 'action.selected'
                                : undefined,
                            borderRadius: 1,
                          }}
                        >
                          <entry.component />
                        </IconButton>
                      ))}
                    </Box>
                  </Box>
                );
              })
            ) : filtered.length > 0 ? (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {filtered.map((entry) => (
                  <IconButton
                    key={entry.name}
                    onClick={() => handleSelect(entry.name)}
                    title={entry.label}
                    sx={{
                      border: '1px solid',
                      borderColor:
                        value === entry.name ? 'primary.main' : 'transparent',
                      bgcolor:
                        value === entry.name ? 'action.selected' : undefined,
                      borderRadius: 1,
                    }}
                  >
                    <entry.component />
                  </IconButton>
                ))}
              </Box>
            ) : (
              <Typography color="text.secondary" textAlign="center">
                No icons found
              </Typography>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          {value && <Button onClick={handleClear}>Clear</Button>}
          <Button onClick={handleClose}>Cancel</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
