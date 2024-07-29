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
        console.log('Fetching data...');
        console.log('api base url:', process.env.REACT_APP_API_BASE_URL);
        api.get('/memories')
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
        api.put(`/memories/${newTableData[index].id}`, newTableData[index]);
    };

    const handleAddRow = () => {
        const row = { ...newRow, quality: { positive: 0, negative: 0 }, dateAdded: new Date() };
        api.post('/memories', row)
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

    const handleDeleteRow = (id) => {
        // delet from database and then update the table
        api.delete(`/memories/${id}`)
        .then(response => {
            setTableData(tableData.filter(row => row.id !== id));
        })
        // on error still show the new row
        .catch(error => {
            console.error('There was an error deleting the row!', error);
        });
    };


      return (
        <div className="w-100 xl:w-4/5 2xl:w-3/4 flex flex-col">
            <div className='m-10 w-100 flex flex-col md:flex-row'>
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
              <tr className='border border-white border-solid'>
                <th onClick={() => handleSort('concept')}>Concept</th>
                <th className='border border-white border-solid'>Definition</th>
                <th className='w-[4em] text-center border border-white border-solid'
                onClick={() => handleSort('quality')}>Quality</th>
                <th className='w-[4em] text-center border border-white border-solid'>+/-</th>
                <th className='w-[5em] text-center border border-white border-solid' onClick={() => handleSort('dateAdded')}>Date Added</th>
              </tr>
            </thead>
            <tbody>
              {sortedData.map((row, index) => (
                <tr key={row.id} className='border border-white border-solid' >
                    <td className='border border-white border-solid'>
                        <button className='mr-4 hover:bg-red-500'
                        onClick={() => handleDeleteRow(row.id)}
                        >-</button>
                        {row.concept}
                        </td>
                    <td className='border border-white border-solid' onClick={() => handleDefinitionClick(index)}>
                    {row.showDefinition ? row.definition : 'Click to show'}
                    </td>
                    <td className='border border-white border-solid'>{`+${row.quality.positive}/-${row.quality.negative}`}</td>
                    <td className='border border-white border-solid'>
                    <button onClick={() => handlePlusMinusClick(index, '+')}>+</button>
                    <button onClick={() => handlePlusMinusClick(index, '-')}>-</button>
                    </td>
                    <td className='border border-white border-solid'>{new Date(row.dateAdded).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
          
        </div>
      );
}

export default Dashboard;