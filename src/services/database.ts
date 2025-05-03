import { openDB, DBSchema, IDBPDatabase } from "idb";

interface PatientDB extends DBSchema {
  patients: {
    value: {
      id: string;
      first_name: string;
      last_name: string;
      date_of_birth: string;
      age: number;
      gender: string;
      email: string;
      phone: string;
      address: string;
      created_at: Date;
      updated_at: Date;
    };
    key: string;
    indexes: {
      by_id: string;
      by_name: string;
      by_email: string;
      by_phone: string;
    };
  };
}

class DatabaseService {
  private db: IDBPDatabase<PatientDB> | null = null;
  private dbName = "patientDB";
  private version = 1;

  private calculateAge(dateOfBirth: string): number {
    const birthDate = new Date(dateOfBirth);
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
  }

  async init() {
    if (!this.db) {
      this.db = await openDB<PatientDB>(this.dbName, this.version, {
        upgrade(db: IDBPDatabase<PatientDB>) {
          const store = db.createObjectStore("patients", { keyPath: "id" });
          store.createIndex("by_id", "id");
          store.createIndex("by_name", ["first_name", "last_name"]);
          store.createIndex("by_email", "email");
          store.createIndex("by_phone", "phone");
        },
      });
    }
    return this.db;
  }

  async addPatient(
    patient: Omit<
      PatientDB["patients"]["value"],
      "id" | "created_at" | "updated_at" | "age"
    >
  ) {
    const db = await this.init();
    const id = crypto.randomUUID();
    const now = new Date();
    const age = this.calculateAge(patient.date_of_birth);

    const patientData = {
      ...patient,
      id,
      age,
      created_at: now,
      updated_at: now,
    };

    try {
      await db.add("patients", patientData);
      this.notifyTabs("add", patientData);
      return patientData;
    } catch (error) {
      if (error instanceof Error && error.name === "ConstraintError") {
        throw new Error(
          "A patient with this email or phone number already exists"
        );
      }
      throw error;
    }
  }

  async getPatient(id: string) {
    const db = await this.init();
    return db.get("patients", id);
  }

  async getAllPatients(): Promise<PatientDB["patients"]["value"][]> {
    try {
      const db = await this.init();
      const tx = db.transaction("patients", "readonly");
      const store = tx.objectStore("patients");
      return await store.getAll();
    } catch (error) {
      console.error("Error getting all patients:", error);
      throw error;
    }
  }

  async searchPatients(query: string) {
    const db = await this.init();
    const tx = db.transaction("patients", "readonly");
    const store = tx.objectStore("patients");
    const allPatients = await store.getAll();

    return allPatients.filter((patient) => {
      const searchFields = [
        patient.first_name,
        patient.last_name,
        patient.email,
        patient.phone,
        patient.address,
      ];

      return searchFields.some((field) =>
        field?.toLowerCase().includes(query.toLowerCase())
      );
    });
  }

  async updatePatient(
    id: string,
    updates: Partial<
      Omit<
        PatientDB["patients"]["value"],
        "id" | "created_at" | "updated_at" | "age"
      >
    >
  ) {
    const db = await this.init();
    const patient = await this.getPatient(id);

    if (!patient) {
      throw new Error("Patient not found");
    }

    const updatedData = {
      ...patient,
      ...updates,
      updated_at: new Date(),
    };

    // Recalculate age if date_of_birth is updated
    if (updates.date_of_birth) {
      updatedData.age = this.calculateAge(updates.date_of_birth);
    }

    await db.put("patients", updatedData);
    this.notifyTabs("update", updatedData);
    return updatedData;
  }

  async deletePatient(id: string) {
    const db = await this.init();
    await db.delete("patients", id);
    this.notifyTabs("delete", { id });
  }

  // Handle multi-tab synchronization
  setupMultiTabSync() {
    if (typeof window !== "undefined") {
      window.addEventListener("storage", (event) => {
        if (event.key?.startsWith("patient_")) {
          // Handle data changes from other tabs
          this.handleTabSync(event);
        }
      });
    }
  }

  private handleTabSync(event: StorageEvent) {
    if (event.newValue) {
      const change = JSON.parse(event.newValue);
      // Handle the change based on the operation type
      switch (change.operation) {
        case "add":
        case "update":
          this.init().then((db) => {
            db.put("patients", change.data);
          });
          break;
        case "delete":
          this.init().then((db) => {
            db.delete("patients", change.id);
          });
          break;
      }
    }
  }

  // Notify other tabs of changes
  protected notifyTabs(operation: "add" | "update" | "delete", data: any) {
    if (typeof window !== "undefined") {
      const key = `patient_${Date.now()}`;
      const value = JSON.stringify({ operation, data });
      window.localStorage.setItem(key, value);
      // Clean up after a short delay
      setTimeout(() => {
        window.localStorage.removeItem(key);
      }, 100);
    }
  }
}

export const db = new DatabaseService();

// Initialize the database and set up multi-tab sync
db.init().then(() => {
  db.setupMultiTabSync();
});

export type Patient = Omit<
  PatientDB["patients"]["value"],
  "created_at" | "updated_at" | "age"
>;

export const addPatient = async (patient: Patient) => {
  return db.addPatient(patient);
};

export const getPatient = (id: string) => db.getPatient(id);
export const getAllPatients = () => db.getAllPatients();
export const searchPatients = (query: string) => db.searchPatients(query);
export const updatePatient = (id: string, updates: Partial<Patient>) => {
  return db.updatePatient(id, updates);
};
export const deletePatient = (id: string) => db.deletePatient(id);
