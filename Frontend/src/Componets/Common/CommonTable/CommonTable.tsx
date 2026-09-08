import React from "react";
import Table from "react-bootstrap/Table";

interface CommonTableProps {
  fields: { key: string; label: string }[];
  data: Record<string, any>[];
  totalCount?: number;
  loading?: boolean;
}

const CommonTable: React.FC<CommonTableProps> = ({
  fields,
  data,
  totalCount,
  loading = false,
}) => (
  <div>
    <Table striped bordered hover responsive>
      <thead>
        <tr>
          {fields.map((field) => (
            <th key={field.key}>{field.label}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {loading ? (
          <tr>
            <td colSpan={fields.length} style={{ textAlign: "center" }}>
              Loading...
            </td>
          </tr>
        ) : data.length === 0 ? (
          <tr>
            <td colSpan={fields.length} style={{ textAlign: "center" }}>
              No data available
            </td>
          </tr>
        ) : (
          data.map((row, idx) => (
            <tr key={idx}>
              {fields.map((field) => (
                <td key={field.key}>{row[field.key]}</td>
              ))}
            </tr>
          ))
        )}
      </tbody>
    </Table>
    {typeof totalCount === "number" && (
      <div style={{ marginTop: "1rem", fontWeight: 500 }}>
        Total Count: {totalCount}
      </div>
    )}
  </div>
);

export default CommonTable;
