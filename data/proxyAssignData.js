module.exports = {
  proxyAssignment: {
    employeeName: 'J C Harambearachchi - 010067',
    employeeCellText: 'J C Harambearachchi 010067', // format as it appears in the table cell (no dash)
    presetName: 'INTERN REQUESTS ONLY PROXY',
    validFrom: '2026-07-19T13:40',
    validUntil: '2026-07-20T13:40',
  },

   bulkProxyAssignment: {
    employee1Text: 'G J P K Silva (010093)A.2. -',
    employee2Text: 'R A N T Perera (010314)A.3',
    employee1CellText: 'G J P K Silva 010093 General',
    employee2CellText: 'R A N T Perera 010314 Deputy',
    presetName: 'APPROVALS ONLY PROXY',
    validFrom: '2026-07-20T10:20',
    validUntil: '2026-07-20T11:20',
  },

  filterTest: {
  dateWithNoResults: '2026-07-14', // deliberately a date with no matching assignments - for empty state test
  grade: 'All Grades', // adjust to a real grade option from your dropdown

  bugCheckDate: {
    displayText: 'Jul 14, 2026',    // format as shown in the table (Valid From column)
    filterValue: '2026-07-14',      // format required by the date filter input
  },
},

buttonTests: {
  employeeForDisableTest: 'G J P K Silva', // update once you pick a real ACTIVE row to test
},

activityLogTest: {
  employeeName: 'J C Harambearachchi - 010067',
  employeeLogText: 'Harambearachchi', // how it appears in Activity Log's Target column
  presetName: 'INTERN REQUESTS ONLY PROXY',
  validFrom: '2026-07-20T13:30',
  validUntil: '2026-07-21T14:30',
},

activityLogActionTest: {
  // no specific employee needed - we'll dynamically pick whatever ACTIVE row exists
},

  dateFilter: {
    validDate: '2026-07-20', // a date known to have log entries
    dateDisplayText: 'Jul 20, 2026', // format as shown in Timestamp column
    noResultsDate: '2020-01-01', // a date guaranteed to have zero entries
  },

  performedByFilter: {
    value: 'All', // update with real dropdown option text/value from codegen
    displayText: 'All', // how it appears in the "Performed By" column
  },

  targetFilter: {
    value: 'All', // update with real dropdown option text/value from codegen
    displayText: 'All', // how it appears in the "Target" column
  },

};