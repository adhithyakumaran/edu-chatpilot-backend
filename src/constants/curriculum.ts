export const TOPICS = [
    { id: 'java', title: 'Java Foundations', totalUnits: 15 },
    { id: 'dsa', title: 'Data Structures', totalUnits: 20 },
    { id: 'system_design', title: 'System Design', totalUnits: 8 },
    { id: 'projects', title: 'Capstone Projects', totalUnits: 5 },
];

// Mock Learning Units (normally this would be in DB)
export const LEARNING_UNITS = [
    { id: 'unit_1', title: 'Java Syntax', type: 'video', topicId: 'java', weight: 1 },
    { id: 'unit_2', title: 'OOP Principles', type: 'video', topicId: 'java', weight: 1 },
    { id: 'unit_3', title: 'ArrayLists', type: 'test', topicId: 'java', weight: 5 },
    // more units...
];
