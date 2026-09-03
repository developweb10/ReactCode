import { useEffect, useState } from "react";
import { useLocation } from "react-router";
import queryString, { ParsedQuery } from "query-string";

export const useQueryParams = () => {
  const [queryParams, setQuery] = useState<ParsedQuery | null>(null);
  const location = useLocation();
  useEffect(() => {
    const parsed = queryString.parse(window.location.search);
    setQuery(parsed);
  }, [location]);

  return { queryParams };
};
