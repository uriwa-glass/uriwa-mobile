import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "../api/supabaseClient";
import Layout from "../components/Layout";
import Button from "../components/Button";
import Card from "../components/Card";

// 타입 정의
interface ClassData {
  id: string;
  title: string;
  description: string;
  category: string;
  price: number;
  original_price?: number;
  image_url?: string;
  duration: number;
  capacity: number;
  curriculum: string[];
  benefits: string[];
  instructor_id?: string;
}

interface Instructor {
  id: string;
  name: string;
  bio: string;
  image_url?: string;
  expertise: string;
  experience: number;
}

const ClassIntro: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [classData, setClassData] = useState<ClassData | null>(null);
  const [instructor, setInstructor] = useState<Instructor | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 수업 정보 로드
  useEffect(() => {
    const loadClassData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // 수업 정보 가져오기
        const { data: classData, error: classError } = await supabase
          .from("classes")
          .select("*")
          .eq("id", id)
          .single();

        if (classError) throw classError;

        setClassData(classData as ClassData);

        // 강사 정보 가져오기
        if (classData.instructor_id) {
          const { data: instructorData, error: instructorError } = await supabase
            .from("instructors")
            .select("*")
            .eq("id", classData.instructor_id)
            .single();

          if (!instructorError) {
            setInstructor(instructorData as Instructor);
          }
        }
      } catch (error: any) {
        console.error("Error loading class data:", error);
        setError("수업 정보를 불러오는 중 오류가 발생했습니다.");
      } finally {
        setIsLoading(false);
      }
    };

    loadClassData();
  }, [id]);

  const calculateDiscount = (original: number, current: number): number => {
    if (!original || original <= current) return 0;
    return Math.round(((original - current) / original) * 100);
  };

  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat("ko-KR").format(price) + "원";
  };

  if (isLoading) {
    return (
      <Layout title="수업 정보">
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="inline-block w-10 h-10 border-3 border-gray-200 border-t-primary-main rounded-full animate-spin mb-5"></div>
          <p className="text-text-secondary text-md">수업 정보를 불러오는 중...</p>
        </div>
      </Layout>
    );
  }

  if (error || !classData) {
    return (
      <Layout title="수업 정보">
        <div className="flex flex-col items-center justify-center py-16 px-5 text-center">
          <p className="text-error-main text-md mb-5">{error || "수업 정보를 찾을 수 없습니다."}</p>
          <Link to="/" className="no-underline">
            <Button variant="primary">홈으로 돌아가기</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  const discount = calculateDiscount(classData.original_price || 0, classData.price);

  return (
    <Layout title={classData.title}>
      <div className="p-4">
        <img
          src={classData.image_url || "/placeholder.jpg"}
          alt={classData.title}
          className="w-full h-48 object-cover rounded-md mb-4"
        />

        <h1 className="text-xl text-text-primary mb-1">{classData.title}</h1>

        <span className="inline-block text-sm text-primary-contrast bg-primary-main px-2 py-1 rounded-sm mb-4">
          {classData.category}
        </span>

        <div className="flex justify-between items-center mb-5">
          <span className="text-lg font-bold text-text-primary">
            {formatPrice(classData.price)}
          </span>

          {discount > 0 && (
            <div>
              <span className="text-sm text-text-secondary line-through mr-2">
                {formatPrice(classData.original_price || 0)}
              </span>
              <span className="text-sm text-error-main font-bold">{discount}% 할인</span>
            </div>
          )}
        </div>

        <Card variant="filled" className="mb-6">
          <section className="mb-6">
            <h2 className="text-lg text-text-primary mb-2 pb-2 border-b border-border-light">
              수업 소개
            </h2>
            <p className="text-md text-text-secondary leading-6 mb-4">{classData.description}</p>
          </section>

          {instructor && (
            <section className="mb-6">
              <h2 className="text-lg text-text-primary mb-2 pb-2 border-b border-border-light">
                강사 소개
              </h2>
              <div className="flex items-center mb-4 p-3 bg-background-light rounded-md">
                <img
                  src={instructor.image_url || "/instructor-placeholder.jpg"}
                  alt={instructor.name}
                  className="w-14 h-14 rounded-full object-cover mr-4"
                />
                <div className="flex-1">
                  <h3 className="text-md text-text-primary mb-1">{instructor.name}</h3>
                  <p className="text-sm text-text-secondary leading-5">{instructor.bio}</p>
                </div>
              </div>
            </section>
          )}

          {classData.curriculum && classData.curriculum.length > 0 && (
            <section className="mb-6">
              <h2 className="text-lg text-text-primary mb-2 pb-2 border-b border-border-light">
                커리큘럼
              </h2>
              <ul className="list-none p-0">
                {classData.curriculum.map((item, index) => (
                  <li
                    key={index}
                    className="py-3 px-3 border-b border-border-light last:border-b-0 text-md text-text-primary"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {classData.benefits && classData.benefits.length > 0 && (
            <section className="mb-6">
              <h2 className="text-lg text-text-primary mb-2 pb-2 border-b border-border-light">
                수강 혜택
              </h2>
              <ul className="list-none p-0">
                {classData.benefits.map((benefit, index) => (
                  <li key={index} className="flex items-center py-2 text-md text-text-primary">
                    <span className="text-success-main mr-2 font-bold">✓</span>
                    {benefit}
                  </li>
                ))}
              </ul>
            </section>
          )}
        </Card>

        <div className="flex gap-3 mt-6">
          <Link to={`/reservation/${classData.id}`} className="flex-1 no-underline">
            <Button variant="primary" fullWidth>
              예약하기
            </Button>
          </Link>
          <Link to="/" className="flex-1 no-underline">
            <Button variant="outline" fullWidth>
              뒤로가기
            </Button>
          </Link>
        </div>
      </div>
    </Layout>
  );
};

export default ClassIntro;
