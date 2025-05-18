import React, { useState, useEffect, useRef } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  getDaysInMonth,
  getMonth,
  getYear,
  subMonths,
  eachMonthOfInterval,
  startOfYear,
  endOfYear,
} from "date-fns";
import { ko } from "date-fns/locale";
import Layout from "../../components/Layout";
import Button from "../../components/Button";
import { supabase } from "../../api/supabaseClient";

// 타입 정의
interface Cancellation {
  id: string;
  created_at: string;
  reason?: string;
  amount_refunded?: number;
  is_penalty: boolean;
  penalty_amount?: number;
  reservation_id: string;
  reservations?: {
    class_id?: string;
    classes?: {
      title?: string;
    };
    user_id?: string;
    student_count?: number;
    total_price?: number;
    created_at?: string;
  };
  // 필요한 경우 더 많은 필드 추가
}

interface MonthlyStat {
  month: string;
  count: number;
  revenueLost: number;
}

interface ClassStat {
  classTitle: string;
  count: number;
}

interface ReasonStat {
  reason: string;
  count: number;
}

interface TooltipData {
  show: boolean;
  text: string;
  x: number;
  y: number;
}

// getChartData 반환 타입을 위한 인터페이스 정의
interface ChartDataItem {
  label: string;
  value: number;
  additionalInfo?: string; // 선택적 프로퍼티로 변경
}

const chartColors = [
  "bg-blue-500",
  "bg-green-500",
  "bg-yellow-500",
  "bg-red-500",
  "bg-purple-500",
  "bg-pink-500",
  "bg-indigo-500",
  "bg-teal-500",
];

const CancellationAnalytics = () => {
  const [activeTab, setActiveTab] = useState<"monthly" | "reason" | "class">("monthly");
  const [loading, setLoading] = useState(true);
  const [allCancellations, setAllCancellations] = useState<Cancellation[]>([]);
  const [timeRange, setTimeRange] = useState<string>("6"); // 기본 6개월

  const [topCancelledClasses, setTopCancelledClasses] = useState<ClassStat[]>([]);
  const [cancellationsByReason, setCancellationsByReason] = useState<ReasonStat[]>([]);
  const [monthlyCancellations, setMonthlyCancellations] = useState<MonthlyStat[]>([]);

  const [tooltipData, setTooltipData] = useState<TooltipData>({
    show: false,
    text: "",
    x: 0,
    y: 0,
  });
  const chartContainerRef = useRef<HTMLDivElement>(null);

  // 데이터 로드
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const now = new Date();
        const startDate = subMonths(now, parseInt(timeRange));

        const { data: cancellationData, error: cancellationError } = await supabase
          .from("cancellations")
          .select(
            `
            id,
            created_at,
            reason,
            amount_refunded,
            is_penalty,
            penalty_amount,
            reservation_id,
            reservations (
              class_id,
              classes (title),
              user_id,
              student_count,
              total_price,
              created_at
            )
          `
          )
          .gte("created_at", startDate.toISOString())
          .order("created_at", { ascending: false });

        if (cancellationError) throw cancellationError;
        setAllCancellations((cancellationData as Cancellation[]) || []);
      } catch (error: any) {
        console.error("Error loading cancellation data:", error);
        // 사용자에게 오류 메시지 표시 로직 추가 가능
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [timeRange]);

  // 데이터 분석 로직 (allCancellations가 변경될 때마다 실행)
  useEffect(() => {
    if (allCancellations.length === 0) {
      setMonthlyCancellations([]);
      setCancellationsByReason([]);
      setTopCancelledClasses([]);
      return;
    }

    // 월별 취소 현황
    const monthlyMap = new Map<string, { count: number; revenueLost: number }>();
    const currentYear = getYear(new Date());
    const start = subMonths(new Date(), parseInt(timeRange) - 1);
    const end = new Date();
    const monthIntervals = eachMonthOfInterval({ start, end });

    monthIntervals.forEach((monthDate) => {
      const monthKey = format(monthDate, "yyyy-MM");
      monthlyMap.set(monthKey, { count: 0, revenueLost: 0 });
    });

    allCancellations.forEach((c) => {
      const monthKey = format(new Date(c.created_at), "yyyy-MM");
      const currentMonthData = monthlyMap.get(monthKey) || { count: 0, revenueLost: 0 };
      currentMonthData.count++;
      currentMonthData.revenueLost += c.reservations?.total_price || 0; // 환불액 또는 예약 금액 기준
      monthlyMap.set(monthKey, currentMonthData);
    });
    const monthlyArray = Array.from(monthlyMap.entries())
      .map(([month, data]) => ({ month, ...data }))
      .sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime());
    setMonthlyCancellations(monthlyArray);

    // 취소 사유별 현황
    const reasonMap = new Map<string, number>();
    allCancellations.forEach((c) => {
      const reason = c.reason || "사유 없음";
      reasonMap.set(reason, (reasonMap.get(reason) || 0) + 1);
    });
    const reasonArray = Array.from(reasonMap.entries())
      .map(([reason, count]) => ({ reason, count }))
      .sort((a, b) => b.count - a.count);
    setCancellationsByReason(reasonArray);

    // 가장 많이 취소된 수업
    const classMap = new Map<string, number>();
    allCancellations.forEach((c) => {
      const classTitle = c.reservations?.classes?.title || "알 수 없는 수업";
      classMap.set(classTitle, (classMap.get(classTitle) || 0) + 1);
    });
    const classArray = Array.from(classMap.entries())
      .map(([classTitle, count]) => ({ classTitle, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10); // 상위 10개
    setTopCancelledClasses(classArray);
  }, [allCancellations, timeRange]);

  const totalCancellations = allCancellations.length;
  const totalRevenueLost = allCancellations.reduce(
    (sum, c) => sum + (c.reservations?.total_price || 0), // 환불액 또는 예약 금액 기준
    0
  );
  const averageCancellationsPerDay = () => {
    if (totalCancellations === 0 || parseInt(timeRange) === 0) return 0;
    const days = parseInt(timeRange) * 30; // 대략적인 계산
    return (totalCancellations / days).toFixed(1);
  };

  const formatMonthLabel = (monthKey: string) => {
    // yyyy-MM -> MM월
    try {
      const date = new Date(monthKey + "-01"); // 일을 추가하여 유효한 날짜 문자열로 만듦
      return format(date, "MM월", { locale: ko });
    } catch {
      return monthKey;
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("ko-KR", { style: "currency", currency: "KRW" }).format(price);
  };

  const showTooltip = (e: React.MouseEvent<HTMLDivElement>, data: string) => {
    if (chartContainerRef.current) {
      const rect = chartContainerRef.current.getBoundingClientRect();
      setTooltipData({
        show: true,
        text: data,
        x: e.clientX - rect.left + 10, // 마우스 위치 기준으로 조정
        y: e.clientY - rect.top - 30, // 마우스 위치 기준으로 조정
      });
    }
  };

  const hideTooltip = () => {
    setTooltipData({ ...tooltipData, show: false });
  };

  const getChartData = (): ChartDataItem[] => {
    switch (activeTab) {
      case "monthly":
        return monthlyCancellations.map((item) => ({
          label: formatMonthLabel(item.month),
          value: item.count,
          additionalInfo: `취소된 예약 금액: ${formatPrice(item.revenueLost)}`,
        }));
      case "reason":
        return cancellationsByReason
          .slice(0, 8)
          .map((item) => ({ label: item.reason, value: item.count })); // 상위 8개
      case "class":
        return topCancelledClasses
          .slice(0, 8)
          .map((item) => ({ label: item.classTitle, value: item.count })); // 상위 8개
      default:
        return [];
    }
  };

  const chartData = getChartData();
  const maxValue = Math.max(0, ...chartData.map((d) => d.value));

  const renderChart = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center h-full">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      );
    }
    if (chartData.length === 0) {
      return (
        <div className="text-center py-10 text-gray-500">
          데이터가 없습니다. 기간을 변경해보세요.
        </div>
      );
    }

    return (
      <div className="flex h-full items-end gap-3 px-2 pb-8 pt-4">
        {" "}
        {/* BarChart */}
        {chartData.map((item, index) => {
          // Linter 오류를 해결하기 위해 item.additionalInfo가 있는 경우에만 툴크에 추가합니다.
          const tooltipText = `${item.label}: ${item.value}건${
            item.additionalInfo ? `\n${item.additionalInfo}` : ""
          }`;
          return (
            <div
              key={item.label}
              className="flex-1 relative group"
              onMouseMove={(e) => showTooltip(e, tooltipText)}
              onMouseLeave={hideTooltip}
            >
              <div
                style={{ height: maxValue > 0 ? `${(item.value / maxValue) * 100}%` : "0%" }}
                className={`rounded-t-md transition-all duration-300 ease-out hover:opacity-80 ${
                  chartColors[index % chartColors.length]
                }`}
              />
              <div
                className="absolute -bottom-6 left-0 right-0 text-center text-xs text-gray-600 truncate"
                title={item.label}
              >
                {item.label}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderTable = () => {
    if (loading) return null; // 차트 로딩으로 충분
    if (allCancellations.length === 0 && !loading) {
      return (
        <div className="p-8 text-center text-gray-500">선택된 기간에 취소된 예약이 없습니다.</div>
      );
    }

    const recentCancellations = allCancellations.slice(0, 10); // 최근 10개만 표시

    return (
      <div className="overflow-x-auto">
        {" "}
        {/* TableContainer */}
        <table className="w-full border-collapse text-sm">
          {" "}
          {/* Table */}
          <thead>
            <tr>
              <th className="p-3 text-left text-gray-600 font-normal border-b border-gray-200">
                예약일
              </th>
              <th className="p-3 text-left text-gray-600 font-normal border-b border-gray-200">
                취소일
              </th>
              <th className="p-3 text-left text-gray-600 font-normal border-b border-gray-200">
                수업명
              </th>
              <th className="p-3 text-left text-gray-600 font-normal border-b border-gray-200">
                사유
              </th>
              <th className="p-3 text-left text-gray-600 font-normal border-b border-gray-200">
                환불액
              </th>
            </tr>
          </thead>
          <tbody>
            {recentCancellations.map((c) => (
              <tr key={c.id} className="border-b border-gray-200 hover:bg-gray-50">
                {" "}
                {/* TableRow */}
                <td className="p-3 align-middle">
                  {c.reservations?.created_at
                    ? format(new Date(c.reservations.created_at), "yy/MM/dd")
                    : "-"}
                </td>{" "}
                {/* TableCell */}
                <td className="p-3 align-middle">
                  {format(new Date(c.created_at), "yy/MM/dd HH:mm")}
                </td>
                <td
                  className="p-3 align-middle truncate max-w-xs"
                  title={c.reservations?.classes?.title}
                >
                  {c.reservations?.classes?.title || "N/A"}
                </td>
                <td className="p-3 align-middle">{c.reason || "-"}</td>
                <td className="p-3 align-middle text-right">
                  {formatPrice(c.amount_refunded || 0)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <Layout title="취소 통계">
      <div className="p-4">
        {" "}
        {/* Container */}
        <h1 className="text-2xl text-text-primary mb-4">취소 통계 분석</h1> {/* Title */}
        <div className="bg-background-paper rounded-md p-4 mb-5 shadow">
          {" "}
          {/* Card */}
          <h2 className="text-lg text-text-primary mb-4 pb-2 border-b border-gray-200">
            {" "}
            {/* SectionTitle */}
            조회 기간 설정
          </h2>
          <div className="flex gap-4 mb-5 flex-wrap items-center">
            {" "}
            {/* FilterContainer */}
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="p-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500" // Select
            >
              <option value="1">최근 1개월</option>
              <option value="3">최근 3개월</option>
              <option value="6">최근 6개월</option>
              <option value="12">최근 1년</option>
            </select>
            {loading && (
              <div className="inline-block w-5 h-5 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
            )}
          </div>
        </div>
        <div className="bg-background-paper rounded-md p-4 mb-5 shadow">
          {" "}
          {/* Card */}
          <h2 className="text-lg text-text-primary mb-4 pb-2 border-b border-gray-200">
            {" "}
            {/* SectionTitle */}
            주요 지표
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
            {" "}
            {/* StatsGrid */}
            {[
              { label: "총 취소 건수", value: totalCancellations, unit: "건" },
              { label: "총 손실액 (예상)", value: formatPrice(totalRevenueLost) },
              { label: "일 평균 취소 건수", value: averageCancellationsPerDay(), unit: "건" },
            ].map((stat) => (
              <div key={stat.label} className="bg-gray-50 rounded-md p-4 text-center">
                {" "}
                {/* StatCard */}
                <div className="text-2xl font-bold text-blue-600 mb-2">
                  {" "}
                  {/* StatValue */}
                  {stat.value}
                  {stat.unit && <span className="text-sm ml-1">{stat.unit}</span>}
                </div>
                <div className="text-sm text-gray-600">{stat.label}</div> {/* StatLabel */}
              </div>
            ))}
          </div>
        </div>
        <div className="bg-background-paper rounded-md p-4 mb-5 shadow">
          {" "}
          {/* Card */}
          <div className="flex border-b border-gray-200 mb-5">
            {" "}
            {/* Tabs */}
            {(["monthly", "reason", "class"] as const).map((tab) => (
              <div
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-3 px-4 cursor-pointer text-sm font-medium
                  ${
                    activeTab === tab
                      ? "border-b-2 border-blue-500 text-blue-600"
                      : "text-gray-500 hover:text-gray-700"
                  }
                `} // Tab
              >
                {tab === "monthly" ? "월별 추이" : tab === "reason" ? "주요 사유별" : "수업별 현황"}
              </div>
            ))}
          </div>
          <div ref={chartContainerRef} className="h-80 mb-6 relative">
            {" "}
            {/* ChartContainer */}
            {renderChart()}
            {tooltipData.show && (
              <div
                style={{ top: tooltipData.y, left: tooltipData.x, position: "absolute" }}
                className="bg-gray-800 text-white text-xs rounded-md p-2 shadow-lg z-10 pointer-events-none whitespace-pre-wrap" // ChartTooltip
              >
                {tooltipData.text}
              </div>
            )}
          </div>
          <div className="flex gap-4 justify-center flex-wrap mt-4">
            {" "}
            {/* Legend */}
            {chartData.slice(0, chartColors.length).map((item, index) => (
              <div key={item.label} className="flex items-center gap-2 text-xs">
                {" "}
                {/* LegendItem */}
                <div
                  className={`w-3 h-3 rounded-sm ${chartColors[index % chartColors.length]}`}
                ></div>{" "}
                {/* LegendColor */}
                <span>{item.label}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-background-paper rounded-md p-4 shadow">
          {" "}
          {/* Card */}
          <h2 className="text-lg text-text-primary mb-4 pb-2 border-b border-gray-200">
            {" "}
            {/* SectionTitle */}
            최근 취소 내역 (최대 10건)
          </h2>
          {renderTable()}
        </div>
      </div>
    </Layout>
  );
};

export default CancellationAnalytics;
