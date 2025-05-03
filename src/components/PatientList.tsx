import React, { useState, useEffect } from "react";
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  IconButton,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Tabs,
  Tab,
} from "@mui/material";
import { Delete as DeleteIcon, Edit as EditIcon } from "@mui/icons-material";
import {
  Patient,
  getAllPatients,
  searchPatients,
  deletePatient,
  updatePatient,
} from "../services/database";
import SqlQuerySearch from "./SqlQuerySearch";

const PatientList: React.FC = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [searchMode, setSearchMode] = useState<"basic" | "sql">("basic");

  const loadPatients = async () => {
    try {
      const data = searchTerm
        ? await searchPatients(searchTerm)
        : await getAllPatients();
      setPatients(data as Patient[]);
    } catch (error) {
      console.error("Failed to load patients:", error);
    }
  };

  useEffect(() => {
    if (searchMode === "basic") {
      loadPatients();
    }
  }, [searchTerm, searchMode]);

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this patient?")) {
      try {
        await deletePatient(id);
        loadPatients();
      } catch (error) {
        console.error("Failed to delete patient:", error);
      }
    }
  };

  const handleEdit = (patient: Patient) => {
    setSelectedPatient(patient);
    setIsEditDialogOpen(true);
  };

  const handleUpdate = async (updatedPatient: Patient) => {
    if (updatedPatient.id) {
      try {
        await updatePatient(updatedPatient.id, updatedPatient);
        setIsEditDialogOpen(false);
        loadPatients();
      } catch (error) {
        console.error("Failed to update patient:", error);
      }
    }
  };

  const handleSqlResults = (results: any[]) => {
    setPatients(results as Patient[]);
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Patient Records
      </Typography>

      <Tabs
        value={searchMode}
        onChange={(_, newValue) => setSearchMode(newValue)}
        sx={{ mb: 3 }}
      >
        <Tab label="Basic Search" value="basic" />
        <Tab label="SQL Query" value="sql" />
      </Tabs>

      {searchMode === "basic" ? (
        <TextField
          fullWidth
          label="Search Patients"
          variant="outlined"
          value={searchTerm}
          onChange={handleSearch}
          sx={{ mb: 3 }}
        />
      ) : (
        <SqlQuerySearch onResults={handleSqlResults} />
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Date of Birth</TableCell>
              <TableCell>Gender</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Phone</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {patients.map((patient) => (
              <TableRow key={patient.id}>
                <TableCell>{`${patient.first_name} ${patient.last_name}`}</TableCell>
                <TableCell>
                  {new Date(patient.date_of_birth).toLocaleDateString()}
                </TableCell>
                <TableCell>{patient.gender}</TableCell>
                <TableCell>{patient.email}</TableCell>
                <TableCell>{patient.phone}</TableCell>
                <TableCell>
                  <IconButton
                    onClick={() => handleEdit(patient)}
                    color="primary"
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    onClick={() => handleDelete(patient.id!)}
                    color="error"
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog
        open={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
      >
        <DialogTitle>Edit Patient</DialogTitle>
        <DialogContent>
          {selectedPatient && (
            <Box sx={{ pt: 2 }}>
              <TextField
                fullWidth
                label="First Name"
                value={selectedPatient.first_name}
                onChange={(e) =>
                  setSelectedPatient({
                    ...selectedPatient,
                    first_name: e.target.value,
                  })
                }
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Last Name"
                value={selectedPatient.last_name}
                onChange={(e) =>
                  setSelectedPatient({
                    ...selectedPatient,
                    last_name: e.target.value,
                  })
                }
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Email"
                value={selectedPatient.email}
                onChange={(e) =>
                  setSelectedPatient({
                    ...selectedPatient,
                    email: e.target.value,
                  })
                }
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Phone"
                value={selectedPatient.phone}
                onChange={(e) =>
                  setSelectedPatient({
                    ...selectedPatient,
                    phone: e.target.value,
                  })
                }
                sx={{ mb: 2 }}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={() => selectedPatient && handleUpdate(selectedPatient)}
            variant="contained"
            color="primary"
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PatientList;
