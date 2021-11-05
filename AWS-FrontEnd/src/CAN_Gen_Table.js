import * as React from 'react';
import { DataGrid, GridActionsCellItem } from '@mui/x-data-grid';
import DeleteIcon from '@mui/icons-material/Delete';
import SecurityIcon from '@mui/icons-material/Security';
import FileCopyIcon from '@mui/icons-material/FileCopy';
import { useEffect , useCallback} from "react";
import Button from '@mui/material/Button';



export default function CAN_Gen_Table(props) {
  useEffect(() => {
    // console.log(props.data);
    var can_gen_rows = Object.values(props.data);
  });

  const cellHandler = useCallback((params) => {
    // console.log("cellHandler Change Handler Inputs: ",params.id,params.field,params.props.value );
    // props.setCANCell(params.id,params.field,params.props.value );
  });


  const upateCompleate = useCallback((id) => {
    // console.log("upateCompleate Inputs: ",id);
    props.PostCANRow(id);
  });


  return (
    <div style={{ height: 600 }}>
      <DataGrid rowHeight={25} editMode="row" rows={Object.values(props.data)} columns={columns} onEditCellPropsChange={cellHandler} onRowEditCommit={upateCompleate}/>
    </div>
  );
}
const columns = [
  { field: 'ThreadID', headerName: 'Thread', width: 100, type: 'number', editable: false  },
  { field: 'enabled', headerName: 'enabled',  width: 100,type: 'boolean', editable: true },
  { field: 'ThreadName', headerName: 'Thread Label',  width: 240, editable: true },
  { field: 'num_messages', headerName: 'num_messages', width: 120, type: 'number', editable: true },
  { field: 'message_index', headerName: 'Index',  width: 120, type: 'number', editable: true },
  { field: 'transmit_number', headerName: 'TX Count', width: 120, type: 'number', editable: true },
  { field: 'cycle_count', headerName: 'cycle_count', width: 120, type: 'number', editable: true },

  { field: 'channel', headerName: 'Channel',  width: 120,type: 'number', editable: true },
  
  // { field: 'restart', headerName: 'Restart',  width: 120,type: 'number', editable: true },
  // { field: 'total', headerName: 'Total',  width: 120,type: 'number', editable: true },
  { field: 'tx_period', headerName: 'Period',  width: 120,type: 'number', editable: true },
  { field: 'tx_delay', headerName: 'tx_delay',  width: 120,type: 'number', editable: true },
  { field: 'stop_after_count', headerName: 'stop_after_count',  width: 120,type: 'number', editable: true },
  { field: 'extended', headerName: 'extended', width: 120, editable: true },
  { field: 'ID', headerName: 'CAN ID', width: 120, editable: true },
  { field: 'DLC', headerName: 'DLC', width: 120, type: 'number', editable: true },
  { field: 'B0', headerName: 'B0', type: 'number', editable: true },
  { field: 'B1', headerName: 'B1', type: 'number', editable: true },
  { field: 'B2', headerName: 'B2', type: 'number', editable: true },
  { field: 'B3', headerName: 'B3', type: 'number', editable: true },
  { field: 'B4', headerName: 'B4', type: 'number', editable: true },
  { field: 'B5', headerName: 'B5', type: 'number', editable: true },
  { field: 'B6', headerName: 'B6', type: 'number', editable: true },
  { field: 'B7', headerName: 'B7', type: 'number', editable: true },
  {
    field: 'actions',
    type: 'actions',
    width: 80,
    getActions: (params) => [
      <GridActionsCellItem
        icon={<DeleteIcon />}
        label="Delete"
        // onClick={deleteUser(params.id)}
      />,
      <GridActionsCellItem
        icon={<SecurityIcon />}
        label="Toggle Admin"
        // onClick={toggleAdmin(params.id)}
        showInMenu
      />,
      <GridActionsCellItem
        icon={<FileCopyIcon />}
        label="Duplicate User"
        // onClick={duplicateUser(params.id)}
        showInMenu
      />,
    ],
  },
//   { 
//     field: 'dateCreated',
//     headerName: 'Date Created',
//     type: 'date',
//     width: 180,
//     editable: true,
//   },
//   {
//     field: 'lastLogin',
//     headerName: 'Last Login',
//     type: 'dateTime',
//     width: 220,
//     editable: true,
//   },
];

const rows = [
  {
    id: 1,
    name: "test_name",
    age: 25,
    thread: 1,
    count: 100,
    index: 1,
    send: 0,
    channel: 1,
    period: 100,
    restart: 0,
    total: 1000,
    tx_count: 100,
    can_id: 0xDEAD,
    dlc: 1,
    b0: 1,
    b1: 1,
    b2: 1,
    b3: 1,
    b4: 1,
    b5: 1,
    b6: 1,
    b7: 1,
    thread_name: "test_thread_name",
  },
  {
    id: 2,
  ThreadID:1,
  enable:1,
  ThreadName:1,
  num_messages:1,
  message_index:1,
  transmit_number:1,
  cycle_count:1,
  channel:1,
  tx_period:1,
  tx_delay:1,
  stop_after_count:1,
  extended:1,
  ID:1,
  DLC:1,
  B0:1,
  B1:1,
  B2:1,
  B3:1,
  B4:1,
  B5:1,
  B6:1,
  B7:1
  }
];
