// TODO: Replace with real reportingManager hierarchy when backend supports it
export interface OrgNode {
  id: string;
  name: string;
  role: string;
  department: string;
  avatar: string;
  children?: OrgNode[];
}

export const mockOrgHierarchy: OrgNode = {
  id: 'CEO-1',
  name: 'Sarah Jenkins',
  role: 'Chief Executive Officer',
  department: 'Executive',
  avatar: 'SJ',
  children: [
    {
      id: 'VP-ENG-1',
      name: 'Michael Chen',
      role: 'VP of Engineering',
      department: 'Engineering',
      avatar: 'MC',
      children: [
        {
          id: 'ENG-MGR-1',
          name: 'David Rodriguez',
          role: 'Engineering Manager',
          department: 'Engineering',
          avatar: 'DR',
          children: [
            { id: 'ENG-1', name: 'Alex Wong', role: 'Frontend Developer', department: 'Engineering', avatar: 'AW' },
            { id: 'ENG-2', name: 'Priya Patel', role: 'Backend Developer', department: 'Engineering', avatar: 'PP' },
            { id: 'ENG-3', name: 'Sam Smith', role: 'DevOps Engineer', department: 'Engineering', avatar: 'SS' }
          ]
        },
        {
          id: 'ENG-MGR-2',
          name: 'Jessica Lee',
          role: 'QA Manager',
          department: 'Engineering',
          avatar: 'JL',
          children: [
            { id: 'QA-1', name: 'Tom Wilson', role: 'QA Automation', department: 'Engineering', avatar: 'TW' },
            { id: 'QA-2', name: 'Nancy Gomez', role: 'QA Manual', department: 'Engineering', avatar: 'NG' }
          ]
        }
      ]
    },
    {
      id: 'VP-HR-1',
      name: 'Elena Rostova',
      role: 'VP of HR',
      department: 'Human Resources',
      avatar: 'ER',
      children: [
        {
          id: 'HR-MGR-1',
          name: 'Robert Fox',
          role: 'HR Manager',
          department: 'Human Resources',
          avatar: 'RF',
          children: [
            { id: 'HR-1', name: 'Alice Walker', role: 'Talent Acquisition', department: 'Human Resources', avatar: 'AW' },
            { id: 'HR-2', name: 'Brian May', role: 'HR Generalist', department: 'Human Resources', avatar: 'BM' }
          ]
        }
      ]
    },
    {
      id: 'VP-SALES-1',
      name: 'Marcus Johnson',
      role: 'VP of Sales',
      department: 'Sales',
      avatar: 'MJ',
      children: [
        {
          id: 'SALES-MGR-1',
          name: 'Sarah Connor',
          role: 'Regional Sales Manager',
          department: 'Sales',
          avatar: 'SC',
          children: [
            { id: 'SALES-1', name: 'John Doe', role: 'Account Executive', department: 'Sales', avatar: 'JD' },
            { id: 'SALES-2', name: 'Jane Smith', role: 'Sales Development Rep', department: 'Sales', avatar: 'JS' }
          ]
        }
      ]
    }
  ]
};
