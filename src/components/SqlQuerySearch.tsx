import React, { useState, useEffect } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  IconButton,
  Tooltip,
  Tabs,
  Tab,
  Alert,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Grid,
  Card,
  CardContent,
  CardActionArea,
} from "@mui/material";
import {
  Search as SearchIcon,
  Refresh as RefreshIcon,
  Code as CodeIcon,
  QueryStats as QueryStatsIcon,
} from "@mui/icons-material";
import { searchPatients, getAllPatients } from "../services/database";

interface SearchResult {
  id: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  age: number;
  gender: string;
  email: string;
  phone: string;
  address: string;
  created_at?: Date;
  updated_at?: Date;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`search-tabpanel-${index}`}
      aria-labelledby={`search-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const exampleQueries = [
  {
    title: "Find Patients by Age Range",
    description: "Search for patients within a specific age range",
    query: "SELECT * FROM patients WHERE age BETWEEN 18 AND 30",
  },
  {
    title: "Recent Registrations",
    description: "Get patients registered in the last 30 days",
    query: "SELECT * FROM patients WHERE created_at >= date('now', '-30 days')",
  },
  {
    title: "Gender Distribution",
    description: "Count patients by gender",
    query: "SELECT gender, COUNT(*) as count FROM patients GROUP BY gender",
  },
];

const SqlQuerySearch: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [allPatients, setAllPatients] = useState<SearchResult[]>([]);
  const [tabValue, setTabValue] = useState(0);
  const [sqlQuery, setSqlQuery] = useState("");
  const [sqlResults, setSqlResults] = useState<SearchResult[]>([]);
  const [sqlError, setSqlError] = useState<string | null>(null);
  const [sqlLoading, setSqlLoading] = useState(false);
  const [filters, setFilters] = useState({
    gender: "all",
    ageRange: "all",
    sortBy: "name",
    sortOrder: "asc",
  });

  useEffect(() => {
    loadAllPatients();
  }, []);

  const loadAllPatients = async () => {
    setLoading(true);
    try {
      const patients = await getAllPatients();
      setAllPatients(patients);
      setResults(patients);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load patients");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      setResults(allPatients);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const searchResults = await searchPatients(searchTerm);
      setResults(searchResults);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An error occurred during search"
      );
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSqlSearch = async () => {
    if (!sqlQuery.trim()) return;

    setSqlLoading(true);
    setSqlError(null);
    setSqlResults([]);

    try {
      // For now, we'll use the existing searchPatients function
      // In a real implementation, this would execute actual SQL queries
      const results = await getAllPatients();

      // Basic query parsing for demonstration
      const query = sqlQuery.toLowerCase();
      let filteredResults = [...results];

      if (query.includes("where")) {
        if (query.includes("age between")) {
          const ageMatch = query.match(/age between (\d+) and (\d+)/i);
          if (ageMatch) {
            const [_, minAge, maxAge] = ageMatch;
            filteredResults = filteredResults.filter(
              (patient) =>
                patient.age >= parseInt(minAge) &&
                patient.age <= parseInt(maxAge)
            );
          }
        } else if (query.includes("gender")) {
          const genderMatch = query.match(/gender\s*=\s*['"]([^'"]+)['"]/i);
          if (genderMatch) {
            const gender = genderMatch[1];
            filteredResults = filteredResults.filter(
              (patient) => patient.gender.toLowerCase() === gender.toLowerCase()
            );
          }
        }
      }

      if (query.includes("group by")) {
        // Handle aggregation queries
        if (query.includes("count(*)")) {
          const groupByField = query.match(/group by\s+(\w+)/i)?.[1];
          if (groupByField === "gender") {
            const genderCounts = filteredResults.reduce((acc, patient) => {
              acc[patient.gender] = (acc[patient.gender] || 0) + 1;
              return acc;
            }, {} as Record<string, number>);

            // Convert to array format for display
            filteredResults = Object.entries(genderCounts).map(
              ([gender, count]) => ({
                id: gender,
                first_name: gender,
                last_name: "",
                date_of_birth: "",
                age: count,
                gender: gender,
                email: "",
                phone: "",
                address: "",
                created_at: new Date(0), // Default value
                updated_at: new Date(0), // Default value
              })
            );
          }
        }
      }

      setSqlResults(filteredResults);
    } catch (error) {
      setSqlError(
        error instanceof Error
          ? error.message
          : "An error occurred during search"
      );
    } finally {
      setSqlLoading(false);
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === "Enter") {
      handleSearch();
    }
  };

  const handleRefresh = () => {
    loadAllPatients();
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleFilterChange = (field: string) => (event: any) => {
    setFilters({ ...filters, [field]: event.target.value });
  };

  const getFilteredResults = (data: SearchResult[]) => {
    let filtered = [...data];

    // Apply gender filter
    if (filters.gender !== "all") {
      filtered = filtered.filter(
        (patient) => patient.gender === filters.gender
      );
    }

    // Apply age range filter
    if (filters.ageRange !== "all") {
      const [min, max] = filters.ageRange.split("-").map(Number);
      filtered = filtered.filter((patient) => {
        const age = calculateAge(new Date(patient.date_of_birth));
        return age >= min && age <= max;
      });
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let comparison = 0;
      switch (filters.sortBy) {
        case "name":
          comparison = `${a.first_name} ${a.last_name}`.localeCompare(
            `${b.first_name} ${b.last_name}`
          );
          break;
        case "dob":
          comparison =
            new Date(a.date_of_birth).getTime() -
            new Date(b.date_of_birth).getTime();
          break;
        default:
          comparison = 0;
      }
      return filters.sortOrder === "asc" ? comparison : -comparison;
    });

    return filtered;
  };

  const calculateAge = (birthDate: Date) => {
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }
    return age;
  };

  const renderResults = (data: SearchResult[]) => {
    const filteredResults = getFilteredResults(data);

    return (
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Age</TableCell>
              <TableCell>Date of Birth</TableCell>
              <TableCell>Gender</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Phone</TableCell>
              <TableCell>Address</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredResults.map((result) => (
              <TableRow key={result.id} hover>
                <TableCell>{`${result.first_name} ${result.last_name}`}</TableCell>
                <TableCell>{result.age}</TableCell>
                <TableCell>
                  {new Date(result.date_of_birth).toLocaleDateString()}
                </TableCell>
                <TableCell>{result.gender}</TableCell>
                <TableCell>{result.email || "-"}</TableCell>
                <TableCell>{result.phone || "-"}</TableCell>
                <TableCell>{result.address || "-"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: "auto", p: 3 }}>
      <Paper elevation={3} sx={{ mb: 3 }}>
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            aria-label="search tabs"
          >
            <Tab label="Quick Search" />
            <Tab label="Advanced Search" />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
            <Typography variant="h5" sx={{ flexGrow: 1 }}>
              Search Patients
            </Typography>
            <Tooltip title="Refresh Data">
              <IconButton onClick={handleRefresh} color="primary">
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          </Box>

          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} md={6}>
              <Box sx={{ display: "flex", gap: 2 }}>
                <TextField
                  fullWidth
                  label="Search"
                  variant="outlined"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Search by name, email, or phone"
                />
                <Button
                  variant="contained"
                  onClick={handleSearch}
                  disabled={loading}
                  startIcon={
                    loading ? <CircularProgress size={20} /> : <SearchIcon />
                  }
                >
                  Search
                </Button>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={{ display: "flex", gap: 2 }}>
                <FormControl fullWidth>
                  <InputLabel>Gender</InputLabel>
                  <Select
                    value={filters.gender}
                    onChange={handleFilterChange("gender")}
                    label="Gender"
                  >
                    <MenuItem value="all">All</MenuItem>
                    <MenuItem value="Male">Male</MenuItem>
                    <MenuItem value="Female">Female</MenuItem>
                    <MenuItem value="Other">Other</MenuItem>
                  </Select>
                </FormControl>
                <FormControl fullWidth>
                  <InputLabel>Age Range</InputLabel>
                  <Select
                    value={filters.ageRange}
                    onChange={handleFilterChange("ageRange")}
                    label="Age Range"
                  >
                    <MenuItem value="all">All Ages</MenuItem>
                    <MenuItem value="0-18">0-18 years</MenuItem>
                    <MenuItem value="19-30">19-30 years</MenuItem>
                    <MenuItem value="31-50">31-50 years</MenuItem>
                    <MenuItem value="51-70">51-70 years</MenuItem>
                    <MenuItem value="71-100">71+ years</MenuItem>
                  </Select>
                </FormControl>
                <FormControl fullWidth>
                  <InputLabel>Sort By</InputLabel>
                  <Select
                    value={filters.sortBy}
                    onChange={handleFilterChange("sortBy")}
                    label="Sort By"
                  >
                    <MenuItem value="name">Name</MenuItem>
                    <MenuItem value="dob">Date of Birth</MenuItem>
                  </Select>
                </FormControl>
                <FormControl fullWidth>
                  <InputLabel>Order</InputLabel>
                  <Select
                    value={filters.sortOrder}
                    onChange={handleFilterChange("sortOrder")}
                    label="Order"
                  >
                    <MenuItem value="asc">Ascending</MenuItem>
                    <MenuItem value="desc">Descending</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            </Grid>
          </Grid>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {results.length > 0
            ? renderResults(results)
            : !loading &&
              searchTerm && (
                <Paper elevation={3} sx={{ p: 2, textAlign: "center" }}>
                  <Typography color="text.secondary">
                    No results found
                  </Typography>
                </Paper>
              )}
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
            <Typography variant="h5" sx={{ flexGrow: 1 }}>
              Advanced Search
            </Typography>
            <Tooltip title="Refresh Data">
              <IconButton onClick={handleRefresh} color="primary">
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          </Box>

          <Grid container spacing={2} sx={{ mb: 3 }}>
            {exampleQueries.map((example, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Card
                  sx={{
                    height: "100%",
                    "&:hover": {
                      boxShadow: 6,
                      transform: "translateY(-2px)",
                      transition: "all 0.3s ease-in-out",
                    },
                  }}
                >
                  <CardActionArea
                    onClick={() => setSqlQuery(example.query)}
                    sx={{ height: "100%" }}
                  >
                    <CardContent>
                      <Box
                        sx={{ display: "flex", alignItems: "center", mb: 1 }}
                      >
                        <QueryStatsIcon color="primary" sx={{ mr: 1 }} />
                        <Typography variant="h6" component="div">
                          {example.title}
                        </Typography>
                      </Box>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mb: 2 }}
                      >
                        {example.description}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          fontFamily: "monospace",
                          backgroundColor: "grey.100",
                          p: 1,
                          borderRadius: 1,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {example.query}
                      </Typography>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
            ))}
          </Grid>

          <Box sx={{ mb: 2 }}>
            <TextField
              fullWidth
              multiline
              rows={4}
              variant="outlined"
              label="Enter Advanced Query"
              value={sqlQuery}
              onChange={(e) => setSqlQuery(e.target.value)}
              placeholder="Example: SELECT * FROM patients WHERE first_name LIKE '%John%'"
              sx={{ mb: 2 }}
            />
            <Button
              variant="contained"
              onClick={handleSqlSearch}
              disabled={sqlLoading || !sqlQuery.trim()}
              startIcon={
                sqlLoading ? <CircularProgress size={20} /> : <CodeIcon />
              }
            >
              Execute Query
            </Button>
          </Box>

          {sqlError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {sqlError}
            </Alert>
          )}

          {sqlLoading ? (
            <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
              <CircularProgress />
            </Box>
          ) : sqlResults.length > 0 ? (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Results ({sqlResults.length})
              </Typography>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Name</TableCell>
                      <TableCell>Age</TableCell>
                      <TableCell>Date of Birth</TableCell>
                      <TableCell>Gender</TableCell>
                      <TableCell>Email</TableCell>
                      <TableCell>Phone</TableCell>
                      <TableCell>Address</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {sqlResults.map((result) => (
                      <TableRow key={result.id} hover>
                        <TableCell>{`${result.first_name} ${result.last_name}`}</TableCell>
                        <TableCell>{result.age}</TableCell>
                        <TableCell>
                          {new Date(result.date_of_birth).toLocaleDateString()}
                        </TableCell>
                        <TableCell>{result.gender}</TableCell>
                        <TableCell>{result.email || "-"}</TableCell>
                        <TableCell>{result.phone || "-"}</TableCell>
                        <TableCell>{result.address || "-"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          ) : sqlQuery && !sqlLoading ? (
            <Paper elevation={3} sx={{ p: 2, textAlign: "center", mt: 2 }}>
              <Typography color="text.secondary">No records found</Typography>
            </Paper>
          ) : null}
        </TabPanel>
      </Paper>
    </Box>
  );
};

export default SqlQuerySearch;
