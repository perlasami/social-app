const socket = io("http://localhost:3000", {
  auth: {
    authorization: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4ZjdmNTMwOTNjZjUzNTlkNTMxOTg5ZCIsImlhdCI6MTc2MTE2MDIxMiwiZXhwIjoxNzYxMTYzODEyLCJqdGkiOiJEUGg4UWlSaXlSRXlCZkU2Nlg1RHEifQ.B8hVSW3jpfgwWxtKl8U4cMUhiHLrOfpRZIvPgXOCCRw"
  },
});
