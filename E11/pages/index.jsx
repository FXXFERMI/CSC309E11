import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/router";

export default function Holidays() {
  const router = useRouter();

  const [holidays, setHolidays] = useState([]);
  // // const [isLoading, setIsLoading] = useState(true); // Loading state for data fetch
  // const currentYear = new Date().getFullYear();
  // // const [year, setYear] = useState(currentYear); //Default year is current year
  // const [year, setYear] = useState(router.query.year ? parseInt(router.query.year) : currentYear); //Default year is current year
  // // const [province, setProvince] = useState("All");//Default province is All
  // const [province, setProvince] = useState(router.query.province || "All");
  // // const [currentPage, setCurrentPage] = useState(1); //Default page is 1
  // const [currentPage, setCurrentPage] = useState(router.query.page ? parseInt(router.query.page) : 1);
  // const pageSize = 10; //Default page size is 10
  // // const [searchTerm, setSearchTerm] = useState(""); //Default search term is empty string
  // const [searchTerm, setSearchTerm] = useState(router.query.search || "");

  // Track when state is fully initialized
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize state with default values only
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(currentYear);
  const [province, setProvince] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const pageSize = 10; //Default page size is 10

  const provinces = [
    "AB", "BC", "MB", "NB", "NL", "NS", "NT", "NU", "ON", "PE", "QC", "SK", "YT"
  ];

  // // Initialize states from URL query parameters
  // useEffect(() => {
  //   if (router.isReady) {
  //     const { year, province, page, search } = router.query;

  //     if (year) setYear(parseInt(year));
  //     if (province) setProvince(province);
  //     if (page) setCurrentPage(parseInt(page));
  //     if (search) setSearchTerm(search);
  //   }
  // }, [router.isReady]);

  // Wait for router to be ready before setting initial state
  useEffect(() => {
    if (router.isReady && !isInitialized) {
      const { year, province, page, search } = router.query;

      setYear(year ? parseInt(year) : currentYear);
      setProvince(province || "All");
      setCurrentPage(page ? parseInt(page) : 1);
      setSearchTerm(search || "");
      setIsInitialized(true); // Ensure this only runs once
    }
  }, [router.isReady, isInitialized]);

  // // Update query parameters in the URL whenever state changes
  // useEffect(() => {
  //   router.push(
  //     {
  //       pathname: router.pathname,
  //       query: {
  //         year,
  //         province,
  //         page: currentPage,
  //         search: searchTerm,
  //       },
  //     },
  //     undefined,
  //     { shallow: true }
  //   );
  // }, [year, province, currentPage, searchTerm]);

  // Update query parameters in the URL whenever state changes, but only if initialized
  useEffect(() => {
    if (isInitialized) {
      router.push(
        {
          pathname: router.pathname,
          query: {
            year,
            province,
            page: currentPage,
            search: searchTerm,
          },
        },
        undefined,
        { shallow: true }
      );
    }
  }, [year, province, currentPage, searchTerm, isInitialized]);



  const fetchHolidays = async (selectedYear) => {
    // setIsLoading(true); // Start loading
    // const provinceParam = selectedProvince === "All" ? "" : `&province=${selectedProvince}`;
    const response = await fetch(`https://canada-holidays.ca/api/v1/holidays?year=${selectedYear}`);
    const data = await response.json();
    setHolidays(data.holidays || []);
    // setIsLoading(false); // End loading
    setCurrentPage(1);
  };

  // useEffect(() => {
  //   fetchHolidays();
  // }, []);

  useEffect(() => {
    fetchHolidays(year);
  }, [year]);

  const handleYearChange = (event) => {
    setYear(event.target.value);
  };

  const handleProvinceChange = (event) => {
    setProvince(event.target.value);
  };

  const handleSearchTermChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const filteredHolidays = useMemo(() => {
    return holidays
      .filter(holiday =>
        // holiday.nameFr.toLowerCase().includes(searchTerm.toLowerCase()) ||
        holiday.nameEn.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .filter(holiday =>
        province === "All" || holiday.provinces.some(pr => pr.id === province)
      );
  }, [holidays, searchTerm, province]);

  // Pagination logic
  const totalPages = Math.ceil(filteredHolidays.length / pageSize);
  const indexOfLastHoliday = currentPage * pageSize;
  const indexOfFirstHoliday = indexOfLastHoliday - pageSize;
  const currentHolidays = filteredHolidays.slice(indexOfFirstHoliday, indexOfLastHoliday);

  const goNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  return (
    <div>
      <style jsx>{`
        * {
          font-family: "Arial";
        }
        h1 {
          text-align: center;
          color: #333;
          margin-bottom: 20px;
        }

        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 20px;
        }

        th,
        td {
          padding: 12px;
          text-align: left;
          border-bottom: 1px solid #ddd;
        }

        tr:hover {
          background-color: #f5f5f5;
        }

        th {
          background-color: #4caf50;
          color: white;
        }

        #year-filter, #province-filter, #holiday-search {
          margin: 0 auto 20px;
          display: block;
          font-size: 16px;
          padding: 8px;
        }

        .pagination-buttons {
          display: flex;
          justify-content: center;
          gap: 10px;
          margin-top: 20px;
        }
      `}</style>

      <h1>Holidays </h1>

      {/* Year Selector */}
      <select id="year-filter" value={year} onChange={handleYearChange}>
        {
          Array.from({ length: 11 }, (_, i) => 2020 + i).map((yearOption) => (
            <option key={yearOption} value={yearOption}>
              {yearOption}
            </option>
          ))
        }
      </select>

      {/* Province Selector */}
      <select id="province-filter" value={province} onChange={handleProvinceChange}>
        <option value="All">All Provinces</option>
        {provinces.map((provinceOption) => (
          <option key={provinceOption} value={provinceOption}>
            {provinceOption}
          </option>
        ))}
      </select>

      {/* Search Bar */}
      <input
        id="holiday-search"
        type="text"
        placeholder="Search holidays by name"
        value={searchTerm}
        onChange={handleSearchTermChange}
      />

      {/* Loading state */}
      <table id="holidays-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Name</th>
            <th>Name (FR)</th>
            <th>Province(s)</th>
          </tr>
        </thead>

        <tbody>
          {currentHolidays.map((holiday) => (
            <tr key={holiday.id}>
              <td>{holiday.date}</td>
              <td>{holiday.nameEn}</td>
              <td>{holiday.nameFr}</td>
              <td>
                {holiday.federal
                  ? "Federal"
                  : holiday.provinces.map((pr) => pr.id).join(" ")}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination Controls */}
      <div className="pagination-buttons">
        <button id="prev-page" onClick={goPreviousPage} disabled={currentPage === 1}>
          Previous
        </button>
        <span>Page {currentPage} of {totalPages}</span>
        <button id="next-page" onClick={goNextPage} disabled={currentPage === totalPages}>
          Next
        </button>
      </div>
    </div>
  );
}
