import React, {useContext, useState, useEffect} from 'react';
import { LoginContext } from '../context/LoginContext';
import { Login } from './Login';
import axios from 'axios';

const api = axios.create({
    baseURL: process.env.REACT_APP_API_BASE_URL
});

const Dashboard = () => {
    const {isLoggedIn} = useContext(LoginContext);
    const [tableData, setTableData] = useState([]);
    const [sortConfig, setSortConfig] = useState(null);
    const [newRow, setNewRow] = useState({ concept: '', definition: '', plusMinus: '' });

    useEffect(() => {
        axios.get('/memories')
          .then(response => {
            setTableData(response.data);
          })
          // on error return empty table
            .catch(error => {
                console.error('Error fetching data: ', error);
                setTableData([]);
            });
      }, []);

        const handleSort = (key) => {
            let direction = 'ascending';
            if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
            }
            setSortConfig({ key, direction });
        };
        
        const sortedData = React.useMemo(() => {
            let sortableItems = [...tableData];
            if (sortConfig !== null) {
            sortableItems.sort((a, b) => {
                if (a[sortConfig.key] < b[sortConfig.key]) {
                return sortConfig.direction === 'ascending' ? -1 : 1;
                }
                if (a[sortConfig.key] > b[sortConfig.key]) {
                return sortConfig.direction === 'ascending' ? 1 : -1;
                }
                return 0;
            });
            }
            return sortableItems;
        }, [tableData, sortConfig]);

        const handleDefinitionClick = (index) => {
            const newTableData = [...tableData];
            newTableData[index].showDefinition = !newTableData[index].showDefinition;
            setTableData(newTableData);
            setTimeout(() => {
              newTableData[index].showDefinition = false;
              setTableData([...newTableData]);
            }, 60000);
          };
    
    const handlePlusMinusClick = (index, value) => {
        const newTableData = [...tableData];
        if (value === '+') {
        newTableData[index].quality.positive += 1;
        } else {
        newTableData[index].quality.negative += 1;
        }
        newTableData[index].plusMinus = value;
        setTableData(newTableData);
        //axios.put(`http://localhost:5000/api/table/${newTableData[index].id}`, newTableData[index]);
    };

    const handleAddRow = () => {
        const row = { ...newRow, quality: { positive: 0, negative: 0 }, dateAdded: new Date() };
        axios.post('/memories', row)
          .then(response => {
            setTableData([...tableData, response.data]);
            setNewRow({ concept: '', definition: '', plusMinus: '' });
          })
          // on error still show the new row
            .catch(error => {
                console.error('Error adding row: ', error);
                setTableData([...tableData, row]);
                setNewRow({ concept: '', definition: '', plusMinus: '' });
            });
          ;
      };


      return (
        <div className="w-100 2xl:w-4/5 flex flex-col">
            <div className='m-10 w-100 flex'>
            <input className='text-black m-4'
              type="text"
              placeholder="Concept"
              value={newRow.concept}
              onChange={(e) => setNewRow({ ...newRow, concept: e.target.value })}
            />
            <input className='text-black m-4'
              type="text"
              placeholder="Definition"
              value={newRow.definition}
              onChange={(e) => setNewRow({ ...newRow, definition: e.target.value })}
            />
            <button className='m-4' onClick={handleAddRow}>Add Row</button>
          </div>
          <table>
            <thead>
              <tr>
                <th onClick={() => handleSort('concept')}>Concept</th>
                <th>Definition</th>
                <th onClick={() => handleSort('quality')}>Quality</th>
                <th>+/-</th>
                <th onClick={() => handleSort('dateAdded')}>Date Added</th>
              </tr>
            </thead>
            <tbody>
              {sortedData.map((row, index) => (
                <tr key={row.id}>
                  <td>{row.concept}</td>
                  <td onClick={() => handleDefinitionClick(index)}>
                    {row.showDefinition ? row.definition : 'Click to show'}
                  </td>
                  <td>{`+${row.quality.positive}/-${row.quality.negative}`}</td>
                  <td>
                    <button onClick={() => handlePlusMinusClick(index, '+')}>+</button>
                    <button onClick={() => handlePlusMinusClick(index, '-')}>-</button>
                  </td>
                  <td>{new Date(row.dateAdded).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
          
        </div>
      );
}

export default Dashboard;