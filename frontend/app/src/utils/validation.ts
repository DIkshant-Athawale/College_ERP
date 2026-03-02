// Email validation
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Phone number validation (Any 10 digits)
export const isValidPhone = (phone: string): boolean => {
  const phoneRegex = /^\d{10}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
};

// Password validation (minimum 8 characters, at least 1 letter and 1 number)
export const isValidPassword = (password: string): boolean => {
  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/;
  return passwordRegex.test(password);
};

// Required field validation
export const isRequired = (value: string | number | null | undefined): boolean => {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string' && value.trim() === '') return false;
  return true;
};

// Date validation (YYYY-MM-DD format)
export const isValidDate = (date: string): boolean => {
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(date)) return false;
  const d = new Date(date);
  return d instanceof Date && !isNaN(d.getTime());
};

// Academic year validation (YYYY-YYYY format)
export const isValidAcademicYear = (year: string): boolean => {
  const yearRegex = /^\d{4}-\d{4}$/;
  if (!yearRegex.test(year)) return false;
  const [start, end] = year.split('-').map(Number);
  return end === start + 1;
};

// Validate teacher form
export const validateTeacherForm = (data: {
  first_name: string;
  last_name: string;
  email: string;
  primary_phone: string;
  department_id: string;
  designation: string;
  password: string;
}, isEdit: boolean = false): Record<string, string> => {
  const errors: Record<string, string> = {};

  if (!isRequired(data.first_name)) {
    errors.first_name = 'First name is required';
  }

  if (!isRequired(data.last_name)) {
    errors.last_name = 'Last name is required';
  }

  if (!isRequired(data.email)) {
    errors.email = 'Email is required';
  } else if (!isValidEmail(data.email)) {
    errors.email = 'Please enter a valid email address';
  }

  if (!isRequired(data.primary_phone)) {
    errors.primary_phone = 'Phone number is required';
  } else if (!isValidPhone(data.primary_phone)) {
    errors.primary_phone = 'Please enter a valid 10-digit phone number';
  }

  if (!isRequired(data.department_id)) {
    errors.department_id = 'Department is required';
  }

  if (!isRequired(data.designation)) {
    errors.designation = 'Designation is required';
  }

  // Password validation: Required for new, optional for edit (unless provided)
  if (!isEdit) {
    if (!isRequired(data.password)) {
      errors.password = 'Password is required';
    } else if (!isValidPassword(data.password)) {
      errors.password = 'Password must be at least 8 characters with at least 1 letter and 1 number';
    }
  } else {
    // In edit mode, only validate if password is provided
    if (data.password && !isValidPassword(data.password)) {
      errors.password = 'Password must be at least 8 characters with at least 1 letter and 1 number';
    }
  }

  return errors;
};

// Validate student form
export const validateStudentForm = (data: {
  first_name: string;
  last_name: string;
  email: string;
  primary_phone: string;
  department_id: string;
  year: string;
  semester: string;
  password: string;
  academic_year: string;
  DOB: string;
}, isEdit: boolean = false): Record<string, string> => {
  const errors: Record<string, string> = {};

  if (!isRequired(data.first_name)) {
    errors.first_name = 'First name is required';
  }

  if (!isRequired(data.last_name)) {
    errors.last_name = 'Last name is required';
  }

  if (!isRequired(data.email)) {
    errors.email = 'Email is required';
  } else if (!isValidEmail(data.email)) {
    errors.email = 'Please enter a valid email address';
  }

  if (!isRequired(data.primary_phone)) {
    errors.primary_phone = 'Phone number is required';
  } else if (!isValidPhone(data.primary_phone)) {
    errors.primary_phone = 'Please enter a valid 10-digit phone number';
  }

  if (!isRequired(data.department_id)) {
    errors.department_id = 'Department is required';
  }

  if (!isRequired(data.year)) {
    errors.year = 'Year is required';
  }

  if (!isRequired(data.semester)) {
    errors.semester = 'Semester is required';
  }

  // Password validation: Required for new, optional for edit (unless provided)
  if (!isEdit) {
    if (!isRequired(data.password)) {
      errors.password = 'Password is required';
    } else if (!isValidPassword(data.password)) {
      errors.password = 'Password must be at least 8 characters with at least 1 letter and 1 number';
    }
  } else {
    // In edit mode, only validate if password is provided
    if (data.password && !isValidPassword(data.password)) {
      errors.password = 'Password must be at least 8 characters with at least 1 letter and 1 number';
    }
  }

  if (!isRequired(data.academic_year)) {
    errors.academic_year = 'Academic year is required';
  } else if (!isValidAcademicYear(data.academic_year)) {
    errors.academic_year = 'Please enter a valid academic year (e.g., 2024-2025)';
  }

  if (data.DOB && !isValidDate(data.DOB)) {
    errors.DOB = 'Please enter a valid date (YYYY-MM-DD)';
  }

  return errors;
};

// Validate course form
export const validateCourseForm = (data: {
  course_code: string;
  course_name: string;
  department_id: string;
  year: string;
  semester: string;
  teacher_id: string;
}): Record<string, string> => {
  const errors: Record<string, string> = {};

  if (!isRequired(data.course_code)) {
    errors.course_code = 'Course code is required';
  }

  if (!isRequired(data.course_name)) {
    errors.course_name = 'Course name is required';
  }

  if (!isRequired(data.department_id)) {
    errors.department_id = 'Department is required';
  }

  if (!isRequired(data.year)) {
    errors.year = 'Year is required';
  }

  if (!isRequired(data.semester)) {
    errors.semester = 'Semester is required';
  }

  if (!isRequired(data.teacher_id)) {
    errors.teacher_id = 'Teacher is required';
  }

  return errors;
};

// Validate department form
export const validateDepartmentForm = (data: {
  department_code: string;
  department_name: string;
}): Record<string, string> => {
  const errors: Record<string, string> = {};

  if (!isRequired(data.department_code)) {
    errors.department_code = 'Department code is required';
  }

  if (!isRequired(data.department_name)) {
    errors.department_name = 'Department name is required';
  }

  return errors;
};
