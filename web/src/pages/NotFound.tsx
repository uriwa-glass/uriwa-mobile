import React from "react";
import { Link } from "react-router-dom";
import Layout from "../components/Layout";
import Button from "../components/Button";

const NotFound: React.FC = () => {
  return (
    <Layout title="페이지를 찾을 수 없습니다" showBackButton={false}>
      <div className="flex flex-col items-center justify-center py-10 px-5 text-center">
        <h1 className="text-4xl text-text-primary mb-4">404</h1>
        <p className="text-lg text-text-secondary mb-8 max-w-md">
          요청하신 페이지를 찾을 수 없습니다.
          <br />
          주소가 올바른지 확인해주세요.
        </p>
        <Link to="/" className="no-underline">
          <Button variant="primary" onClick={() => {}}>
            홈으로 돌아가기
          </Button>
        </Link>
      </div>
    </Layout>
  );
};

export default NotFound;
