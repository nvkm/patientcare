import React, { useState } from "react";
import {
  Box,
  TextField,
  Button,
  Grid,
  MenuItem,
  Typography,
  InputAdornment,
  styled,
  Paper,
  Container,
  alpha,
  useTheme,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { CalendarToday as CalendarIcon } from "@mui/icons-material";
import { Patient, addPatient } from "../services/database";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { format, isValid, subYears } from "date-fns";
import { DateValidationError } from "@mui/x-date-pickers";

const initialPatientState: Patient = {
  id: "",
  first_name: "",
  last_name: "",
  date_of_birth: "",
  gender: "",
  email: "",
  phone: "",
  address: "",
};

const emailDomains = [
  "gmail.com",
  "yahoo.com",
  "hotmail.com",
  "rediffmail.com",
  "outlook.com",
];

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  borderRadius: theme.spacing(2),
  boxShadow: `0 8px 32px ${alpha(theme.palette.primary.main, 0.1)}`,
  transition: "transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
  "&:hover": {
    transform: "translateY(-2px)",
    boxShadow: `0 12px 48px ${alpha(theme.palette.primary.main, 0.15)}`,
  },
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  "& .MuiOutlinedInput-root": {
    borderRadius: theme.spacing(1),
    transition: "all 0.2s ease-in-out",
    "&:hover": {
      backgroundColor: alpha(theme.palette.primary.main, 0.04),
    },
    "&.Mui-focused": {
      boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.2)}`,
    },
  },
}));

const StyledDatePicker = styled(DatePicker)(({ theme }) => ({
  "& .MuiInputBase-root": {
    cursor: "pointer",
    borderRadius: theme.spacing(1),
    transition: "all 0.2s ease-in-out",
    "&:hover": {
      backgroundColor: alpha(theme.palette.primary.main, 0.04),
    },
    "&.Mui-focused": {
      boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.2)}`,
    },
  },
  "& .MuiInputAdornment-root": {
    cursor: "pointer",
  },
}));

const StyledButton = styled(Button)(({ theme }) => ({
  borderRadius: theme.spacing(1),
  padding: theme.spacing(1.5),
  textTransform: "none",
  fontSize: "1rem",
  fontWeight: 600,
  transition: "all 0.2s ease-in-out",
  "&:hover": {
    transform: "translateY(-1px)",
    boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`,
  },
}));

const FormTitle = styled(Typography)(({ theme }) => ({
  color: theme.palette.primary.main,
  fontWeight: 600,
  marginBottom: theme.spacing(4),
  textAlign: "center",
}));

const PatientForm: React.FC = () => {
  const theme = useTheme();
  const [patient, setPatient] = useState<Patient>(initialPatientState);
  const [errors, setErrors] = useState<Partial<Record<keyof Patient, string>>>(
    {}
  );
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const validateEmail = (email: string) => {
    if (!email) return true; // Email is optional
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const domain = email.split("@")[1];
    return emailRegex.test(email) && emailDomains.includes(domain);
  };

  const validatePhone = (phone: string) => {
    if (!phone) return true; // Phone is optional
    const phoneRegex = /^[0-9]{10}$/;
    return phoneRegex.test(phone);
  };

  const validateName = (name: string) => {
    return name.length >= 2 && /^[a-zA-Z\s]*$/.test(name);
  };

  const validateDateOfBirth = (date: string) => {
    if (!date) return false;
    const dob = new Date(date);
    const today = new Date();
    const age = today.getFullYear() - dob.getFullYear();
    return age >= 0 && age <= 120;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPatient((prev) => ({ ...prev, [name]: value }));

    // Validate field
    let error = "";
    switch (name) {
      case "first_name":
      case "last_name":
        if (!validateName(value)) {
          error =
            "Name should contain only letters and be at least 2 characters long";
        }
        break;
      case "email":
        if (!validateEmail(value)) {
          error = "Please enter a valid email address from supported domains";
        }
        break;
      case "phone":
        if (!validatePhone(value)) {
          error = "Please enter a valid 10-digit phone number";
        }
        break;
    }

    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const handleDateChange = (
    value: unknown,
    _context: { validationError: DateValidationError }
  ) => {
    const dateValue = value as Date | null;
    setSelectedDate(dateValue);

    if (dateValue && isValid(dateValue)) {
      const formattedDate = format(dateValue, "yyyy-MM-dd");
      
      setPatient((prev) => ({ ...prev, date_of_birth: formattedDate }));

      if (!validateDateOfBirth(formattedDate)) {
        setErrors((prev) => ({
          ...prev,
          date_of_birth: "Please enter a valid date of birth",
        }));
      } else {
        setErrors((prev) => ({ ...prev, date_of_birth: "" }));
      }
    } else {
      setPatient((prev) => ({ ...prev, date_of_birth: "" }));
      setErrors((prev) => ({
        ...prev,
        date_of_birth: "Please select a valid date",
      }));
    }
  };

  const handleCalendarIconClick = () => {
    setIsOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all fields
    const newErrors: Partial<Record<keyof Patient, string>> = {};

    if (!validateName(patient.first_name)) {
      newErrors.first_name =
        "First name should contain only letters and be at least 2 characters long";
    }
    if (!validateName(patient.last_name)) {
      newErrors.last_name =
        "Last name should contain only letters and be at least 2 characters long";
    }
    if (patient.date_of_birth && !validateDateOfBirth(patient.date_of_birth)) {
      newErrors.date_of_birth = "Please enter a valid date of birth";
    }
    if (patient.email && !validateEmail(patient.email)) {
      newErrors.email =
        "Please enter a valid email address from supported domains";
    }
    if (patient.phone && !validatePhone(patient.phone)) {
      newErrors.phone = "Please enter a valid 10-digit phone number";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      toast.error("Please fix the errors in the form", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      return;
    }

    try {
      await addPatient(patient);
      setPatient(initialPatientState);
      toast.success("Patient registered successfully!", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } catch (error) {
      toast.error("Failed to register patient. Please try again.", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }
  };

  return (
    <Container maxWidth="md">
      <StyledPaper elevation={0}>
        <Box component="form" onSubmit={handleSubmit} noValidate>
          <ToastContainer
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="light"
          />
          <FormTitle variant="h4" gutterBottom>
            Register New Patient
          </FormTitle>

          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <StyledTextField
                required
                fullWidth
                label="First Name"
                name="first_name"
                value={patient.first_name}
                onChange={handleChange}
                error={!!errors.first_name}
                helperText={errors.first_name}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <StyledTextField
                required
                fullWidth
                label="Last Name"
                name="last_name"
                value={patient.last_name}
                onChange={handleChange}
                error={!!errors.last_name}
                helperText={errors.last_name}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <StyledDatePicker
                  label="Date of Birth"
                  value={selectedDate}
                  onChange={handleDateChange}
                  open={isOpen}
                  onOpen={() => setIsOpen(true)}
                  onClose={() => setIsOpen(false)}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      required: true,
                      error: !!errors.date_of_birth,
                      helperText: errors.date_of_birth,
                      variant: "outlined",
                      InputProps: {
                        endAdornment: (
                          <InputAdornment position="end">
                            <CalendarIcon
                              sx={{
                                cursor: "pointer",
                                color: theme.palette.primary.main,
                              }}
                              onClick={handleCalendarIconClick}
                            />
                          </InputAdornment>
                        ),
                      },
                    },
                    actionBar: {
                      actions: ["clear", "accept"],
                    },
                  }}
                  openTo="year"
                  views={["year", "month", "day"]}
                  maxDate={new Date()}
                  minDate={subYears(new Date(), 120)}
                  disableFuture
                  format="dd/MM/yyyy"
                  closeOnSelect={false}
                  showDaysOutsideCurrentMonth
                  fixedWeekNumber={6}
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={12} sm={6}>
              <StyledTextField
                required
                fullWidth
                select
                label="Gender"
                name="gender"
                value={patient.gender}
                onChange={handleChange}
                variant="outlined"
              >
                <MenuItem value="male">Male</MenuItem>
                <MenuItem value="female">Female</MenuItem>
                <MenuItem value="other">Other</MenuItem>
              </StyledTextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <StyledTextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={patient.email}
                onChange={handleChange}
                error={!!errors.email}
                helperText={
                  errors.email ||
                  "Supported domains: gmail.com, yahoo.com, hotmail.com, rediffmail.com, outlook.com"
                }
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <StyledTextField
                fullWidth
                label="Phone"
                name="phone"
                value={patient.phone}
                onChange={handleChange}
                error={!!errors.phone}
                helperText={errors.phone || "Enter 10-digit phone number"}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12}>
              <StyledTextField
                fullWidth
                label="Address"
                name="address"
                multiline
                rows={3}
                value={patient.address}
                onChange={handleChange}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12}>
              <StyledButton
                type="submit"
                variant="contained"
                color="primary"
                size="large"
                fullWidth
              >
                Register Patient
              </StyledButton>
            </Grid>
          </Grid>
        </Box>
      </StyledPaper>
    </Container>
  );
};

export default PatientForm;
