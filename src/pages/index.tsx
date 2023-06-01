import { Card, Divider, Spin } from "antd";
import { useCallback, useEffect, useRef } from "react";
import { useInfiniteQuery } from "react-query";
import styled from "styled-components";

const TableContainer = styled.div`
  display: contents;
`;
const CustomInfiniteScroll = styled.div``;

const CenteredText = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`;
const Container = styled.div`
  align-items: center;
  justify-content: center;
  display: flex;
  flex-direction: column;
`;

const maxItemCount = 100;

const ItemList: React.FC = () => {
  const observerElem = useRef(null);

  /**
   *
   * this function retrieves data
   * from an API endpoint using pagination
   * parameters (offset and limit)
   * and assigns a nextPage value based on
   * the length of the data received
   *
   */
  const fetchItems = async (page: number) => {
    const pageSize = 3;
    const response: any = await fetch(
      `https://api.escuelajs.co/api/v1/products?offset=${page}&limit=${pageSize}` //using free api for this example
    );
    const data = await response.json();
    data["nextPage"] = data.length > maxItemCount ? page + 1 : null;
    return data;
  };

  /**
   *fetching data using React-Query's useInfiniteQuery hook
   *this code snippet sets up the infrastructure for paginated
    data fetching using useInfiniteQuery
   *
   */
  const { data, fetchNextPage, isFetchingNextPage, hasNextPage } =
    useInfiniteQuery(
      ["fetch-notification"],
      ({ pageParam = 1 }) => fetchItems(pageParam),
      {
        refetchOnWindowFocus: false,
        keepPreviousData: false,
        getNextPageParam: (lastpage, allPages) => {
          const nextPage = allPages.length + 1;
          if (lastpage?.nextPage <= maxItemCount) {
            return nextPage;
          }
          return undefined;
        },
      }
    );

  /**
   *
   * This function is trigger fetchNextPage
   * when observerElem isvisible in the viewport
   *
   */
  const handleObserver = useCallback(
    (entries: any) => {
      const [target] = entries;
      if (target.isIntersecting) {
        fetchNextPage();
      }
    },
    [fetchNextPage]
  );

  /**
   *
   * This function is used to detect when a specific element
   * (in our case div with ref observerElem )
   * becomes visible in the viewport
   *
   */

  useEffect(() => {
    const element = observerElem.current;
    const option = { threshold: 0 };

    const observer = new IntersectionObserver(handleObserver, option);
    if (element) {
      observer.observe(element);
      return () => observer.unobserve(element);
    }
  }, [fetchNextPage, hasNextPage, handleObserver]);
  return (
    <TableContainer id={"scrollableDiv"}>
      {!data ? (
        <CenteredText>
          <Spin size={"large"} />
        </CenteredText>
      ) : (
        <CustomInfiniteScroll>
          {data?.pages?.map((group, index_group) => {
            return (
              <Container key={index_group}>
                {group?.map((data: any, index: number) => {
                  return (
                    <div key={`${index}-${data?.index || 0}`}>
                      <Card
                        hoverable
                        style={{ width: "350px" }}
                        cover={
                          <img
                            src={data.images[0]}
                            width={200}
                            height={200}
                            style={{ objectFit: "contain", padding: "20px" }}
                          />
                        }
                        title={data.title || ""}
                      >
                        <Card.Meta
                          title={`Rs.${data.price}` || ""}
                          description={data.description || ""}
                        />
                      </Card>
                      <Divider
                        style={{
                          marginTop: "10px",
                          marginBottom: "10px",
                        }}
                      />
                    </div>
                  );
                })}
              </Container>
            );
          })}
          <div className={"loader"} ref={observerElem}>
            {isFetchingNextPage && hasNextPage ? (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Spin />
              </div>
            ) : (
              <CenteredText>{"No search left"}</CenteredText>
            )}
          </div>
        </CustomInfiniteScroll>
      )}
    </TableContainer>
  );
};

export default ItemList;
