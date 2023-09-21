import { format } from 'date-fns';
import { getUserJSON } from '../../../utils.js';
import { formatRank, getDisplayTextForUser } from '../../utils.js';
import { initQuestTable } from './utils.js';

export const createQuestLBDisplay = async (data: any) => {
  const { LC_ID } = await getUserJSON();
  const table = initQuestTable();
  const userDisplayData: { rank?: number; name?: string } = {};

  // Format and push rowData to table

  interface DataRow {
    _id: string;
    firstName: string;
    lastInit: string;
    passedCount: number;
    minSpeed?: number;
    mostRecent: Date;
  }

  const typedData: DataRow[] = data;
  typedData.forEach((row, i) => {
    if (row._id === LC_ID) {
      userDisplayData.rank = i + 1;
      userDisplayData.name = `${row.firstName} ${row.lastInit}.`;
    }
    const rank = formatRank(i);
    const name = `${row.firstName} ${row.lastInit}.`;
    const passedCount = row.passedCount;
    const minSpeed = row.minSpeed ? `${row.minSpeed}ms` : 'N/A';
    const mostRecent = format(new Date(row.mostRecent), 'MM-dd-yyyy');
    table.push([rank, name, passedCount, minSpeed, mostRecent]);
  });

  const userDisplayText = getDisplayTextForUser(userDisplayData);

  return { table, userDisplayText };
};
