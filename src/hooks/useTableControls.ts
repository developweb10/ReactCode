import { useEffect, useState, useRef, useMemo, useCallback } from "react";
import { parse, stringify, ParsedQs } from "qs";

import { useHistory, useLocation } from "react-router-dom";
import { debounceTime } from "rxjs/operators";
import { Subject } from "rxjs";
import { FilterEntity } from "@components/filter/types";

type FilterObjectType = { [key: string]: FilterEntity<any> };

const filtersToQuery = <T = FilterObjectType>(newFilters: T) => {
  let newFiltersQuery: { [key: string]: any } = {};
  for (const key in newFilters) {
    if (Object.prototype.hasOwnProperty.call(newFilters, key)) {
      const element: any = newFilters[key];
      if (element.appliedFilters.length) {
        const values = element.appliedFilters.reduce((prev: any, curr: any) => {
          return [...prev, ...Object.values(curr)];
        }, []);
        newFiltersQuery[`${key},${element.mapParamsProp}`] = values;
      }
    }
  }
  return newFiltersQuery;
};

const queryToFilters = (filters: ParsedQs) => {
  let filtersObj: FilterObjectType = {};

  const keywords: { [key: string]: boolean } = { true: true, false: false };
  for (const [key, value] of Object.entries(filters)) {
    const [filterKey, mapKey] = key.split(",");
    if (value && typeof value === "string") {
      const appliedFilters = value
        .split(",")
        .reduce((result: any, curr: any, index: number, arr: any) => {
          if (index % 2 === 0) {
            let name = arr[index];
            let value = arr[index + 1];
            if (/^(\d+|\d*\.\d+)$/.test(value)) {
              value = parseFloat(value);
            }

            if (name in keywords) {
              name = keywords[name];
            }
            if (value in keywords) {
              value = keywords[value];
            }
            result.push({ name, value });
          }
          return result;
        }, []);

      filtersObj[filterKey] = {
        mapParamsProp: mapKey,
        appliedFilters,
      };
    }
  }

  return filtersObj;
};
interface InitialValues<Filters = FilterObjectType> {
  page?: number;
  search?: string;
  sort?: string;
  size?: number;
  tab?: number;
  filters?: Filters;
}
// type Prop = keyof InitialValues;
interface UseTableControlsArgs<Filters = FilterObjectType> {
  onDataFetchRequired: () => void;
  initialValues?: InitialValues<Filters>;
  historyState?: any;
}

export const useTableControls = <T = FilterObjectType>({
  onDataFetchRequired,
  initialValues,
  historyState,
}: UseTableControlsArgs<T>) => {
  const location = useLocation();
  const history = useHistory();

  // PARSE QUERY PARAMS WITH NUMBERS

  const historyStateData = useRef(historyState);
  const defaultValues = useRef({
    page: initialValues?.page || 1,
    search: initialValues?.search || "",
    sort: initialValues?.sort || "",
    size: initialValues?.size || 20,
    tab: initialValues?.tab || 1,
    filters: initialValues?.filters || ({} as T),
  });

  const getQueryValues = useCallback((query: string) => {
    const queryParams = parse(query, { ignoreQueryPrefix: true });
    let newFiltersObj = {};
    try {
      const parsedFilters = queryParams.filters as ParsedQs;
      if (Object.prototype.toString.call(parsedFilters) === "[object Object]") {
        newFiltersObj = queryToFilters(parsedFilters);
      }
    } catch (error) {}

    return {
      page:
        (typeof queryParams.page == "string" && parseInt(queryParams.page)) ||
        defaultValues.current.page,
      search:
        (typeof queryParams.search == "string" && queryParams.search) ||
        defaultValues.current.search,
      sort:
        (typeof queryParams.sort == "string" && queryParams.sort) ||
        defaultValues.current.sort,
      size:
        (typeof queryParams.size == "string" && parseInt(queryParams.size)) ||
        defaultValues.current.size,
      tab:
        (typeof queryParams.tab == "string" && parseInt(queryParams.tab)) ||
        defaultValues.current.tab,

      filters: { ...defaultValues.current.filters, ...(newFiltersObj as T) },
    };
  }, []);

  const initialQueryState = useMemo(() => {
    return getQueryValues(location.search);
  }, [getQueryValues, location.search]);

  const [
    { page, search, sort, size, tab, filters, requestRequired },
    setTableState,
  ] = useState({
    ...initialQueryState,

    requestRequired: true,
  });

  // On Search Callback using RXjs
  const onSearch$ = useRef(new Subject<string>());

  useEffect(() => {
    const subscription = onSearch$.current
      .pipe(debounceTime(600))
      .subscribe((newSearch) => {
        const queryParams = parse(location.search, { ignoreQueryPrefix: true });
        setTableState((state) => ({
          ...state,
          page: defaultValues.current.page,
          search: newSearch,
        }));

        history.push(
          location.pathname +
            "?" +
            stringify({
              ...queryParams,
              page: undefined,
              // If search === "" remove query params
              search: newSearch || undefined,
            }),
          historyStateData.current
        );
      });
    return () => {
      subscription.unsubscribe();
    };
  }, [history, location.pathname, location.search]);

  // Filter Handler

  const handleFilterChange = (newFilters: T) => {
    const queryParams = parse(location.search, { ignoreQueryPrefix: true });
    setTableState((state) => ({
      ...state,
      filters: newFilters,
      requestRequired: true,
    }));

    const newFiltersQuery = filtersToQuery(newFilters);
    history.push(
      location.pathname +
        "?" +
        stringify(
          {
            ...queryParams,
            filters: newFiltersQuery,
          },
          { arrayFormat: "comma", encode: false }
        ),
      historyStateData.current
    );
  };

  const handleFilterReset = () => {
    const queryParams = parse(location.search, { ignoreQueryPrefix: true });
    setTableState((state) => ({
      ...state,
      filters: defaultValues.current.filters,
      requestRequired: true,
    }));
    history.push(
      location.pathname +
        "?" +
        stringify({
          ...queryParams,
          filters: undefined,
        }),
      historyStateData.current
    );
  };

  // Tab Handler

  const handleTabChange = async (
    event: React.ChangeEvent<{}>,
    newTab: number
  ) => {
    setTableState((state) => ({
      ...state,
      tab: newTab,
      page: defaultValues.current.page,
      sort: defaultValues.current.sort,
      size: defaultValues.current.size,
      filters: defaultValues.current.filters,
    }));
    history.push(
      location.pathname +
        "?" +
        stringify({ tab: newTab, search: search || undefined }),
      historyStateData.current
    );
  };

  // Page Handler
  const handlePageChange = async (newPage: number) => {
    const queryParams = parse(location.search, { ignoreQueryPrefix: true });
    setTableState((state) => ({
      ...state,
      page: newPage,
    }));

    history.push(
      location.pathname + "?" + stringify({ ...queryParams, page: newPage }),
      historyStateData.current
    );
  };

  // Size Handler
  const handleSizeChange = async (newSize: number) => {
    const queryParams = parse(location.search, { ignoreQueryPrefix: true });
    setTableState((state) => ({
      ...state,
      size: newSize,
      page: defaultValues.current.page,
    }));
    history.push(
      location.pathname +
        "?" +
        stringify({
          ...queryParams,
          page: defaultValues.current.page,
          size: newSize,
        }),
      historyStateData.current
    );
  };

  // Sort Handler
  const handleSortChange = (sortString: string) => {
    const queryParams = parse(location.search, { ignoreQueryPrefix: true });

    setTableState((state) => ({
      ...state,
      sort: sortString,
    }));

    history.push(
      location.pathname + "?" + stringify({ ...queryParams, sort: sortString }),
      historyStateData.current
    );
  };

  // Search Handler
  const handleSearchChange = (newValue: string) => {
    onSearch$.current.next(newValue);
  };

  const isInitialMount = useRef(true);

  // Location change state update
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
    } else {
      const newValues = getQueryValues(location.search);

      setTableState((state) => ({
        ...state,
        ...newValues,
        requestRequired: true,
      }));
    }
  }, [getQueryValues, location]);

  // Main Table Data Fetch sideeffect
  useEffect(() => {
    if (requestRequired) {
      setTableState((state) => ({
        ...state,
        requestRequired: false,
      }));
      onDataFetchRequired();
    }
  }, [requestRequired, onDataFetchRequired]);

  return {
    values: {
      page,
      search,
      sort,
      tab,
      size,
      filters,
    },
    handlers: {
      handlePageChange,
      handleSizeChange,
      handleTabChange,
      handleSortChange,
      handleSearchChange,
      handleFilterChange,
      handleFilterReset,
    },
  };
};
