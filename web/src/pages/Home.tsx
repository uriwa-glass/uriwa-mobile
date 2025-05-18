import React from "react";
import { Link } from "react-router-dom";
import Layout from "../components/Layout";
import Button from "../components/Button";

const Home = () => {
  return (
    <Layout title="URIWA 모바일" showBackButton={false}>
      <div className="p-4">
        <div className="p-5 bg-background-paper rounded-md mb-5 text-center">
          <h1 className="text-2xl text-text-primary mb-3">URIWA 모바일</h1>
          <p className="text-md text-text-secondary mb-6">웹뷰 기반 모바일 앱 예제입니다.</p>
          <Link to="/inquiry" className="inline-block no-underline">
            <Button variant="primary">문의하기</Button>
          </Link>
        </div>

        <section className="p-5 bg-background-paper rounded-md mb-5">
          <h2 className="text-xl text-text-primary mb-4 pb-2 border-b border-border-light">
            주요 기능
          </h2>
          <div className="flex flex-col gap-2.5">
            <Link to="/inquiry" className="no-underline">
              <Button variant="outline" fullWidth>
                문의하기
              </Button>
            </Link>
            <Link to="/inquiry/dynamic" className="no-underline">
              <Button variant="outline" fullWidth>
                동적 문의 폼
              </Button>
            </Link>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default Home;
