export interface User {
  _id: string;
  name: string;
  email: string;
  phone: string;
  password: string;
  role: string;
  details: {
    firstName: string;
    lastName: string;
    dob: string | Date;
    aadharNumber: string;
    countryCode: string;
    occupation: string;
    addressDetails: {
      street: string;
      city: string;
      state: string;
      pinCode: string;
    };
    employment: {
      employer: string;
      jobTitle: string;
      annualIncome: number;
      employmentType: string;
      yearsEmployed: number;
    };
    education: {
      institution: string;
      degree: string;
      fieldOfStudy: string;
      yearOfStudy: string;
      expectedGraduation: string;
      feeStructure: string;
    };
    otherOccupation: {
      occupationDescription: string;
      sourceOfIncome: string;
      monthlyIncome: number | null;
    };
    monthlyIncome?: number;
    employmentStatus?: string;
    creditScore?: number;
    dateJoined?: string;
  };
}
