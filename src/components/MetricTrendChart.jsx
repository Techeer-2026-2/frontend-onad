import { useState } from 'react'

const WIDTH = 760
const HEIGHT = 290
const PADDING = { top: 18, right: 24, bottom: 45, left: 64 }
const GRID_COUNT = 4
const MAX_X_LABELS = 10

function MetricTrendChart({ labels, values, metricLabel, formatValue }) {
  const [hoveredIndex, setHoveredIndex] = useState(null)
  const chartWidth = WIDTH - PADDING.left - PADDING.right
  const chartHeight = HEIGHT - PADDING.top - PADDING.bottom
  const baseY = PADDING.top + chartHeight
  // 최댓값보다 20% 여유를 둬서 선이 위쪽 끝에 붙지 않게 한다 (값이 모두 0이면 1로 나눈다)
  const maxValue = Math.max(...values) * 1.2 || 1
  const step = chartWidth / labels.length
  // 라벨이 많으면 몇 칸마다 하나씩만 표시한다 (7개 → 전부, 30개 → 3칸마다)
  const labelStep = Math.ceil(labels.length / MAX_X_LABELS)

  const points = values.map((value, index) => ({
    x: PADDING.left + step * index + step / 2,
    y: baseY - (value / maxValue) * chartHeight,
  }))
  const linePoints = points.map(({ x, y }) => `${x},${y}`).join(' ')
  const areaPoints = `${points[0].x},${baseY} ${linePoints} ${points.at(-1).x},${baseY}`
  const gridValues = Array.from({ length: GRID_COUNT + 1 }, (_, index) => (maxValue / GRID_COUNT) * index)

  return (
    <div className="w-full min-w-0">
      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} role="img" aria-label={`${metricLabel} 추이 샘플 차트`} className="h-96 w-full" onMouseLeave={() => setHoveredIndex(null)}>
        {/* y축 눈금선 + 단위가 붙은 눈금 값 */}
        {gridValues.map((gridValue) => {
          const y = baseY - (gridValue / maxValue) * chartHeight
          return (
            <g key={gridValue}>
              <line x1={PADDING.left} x2={WIDTH - PADDING.right} y1={y} y2={y} stroke="#F0EFF7" />
              <text x={PADDING.left - 10} y={y + 4} textAnchor="end" fill="#9A97A7" fontSize="10">{formatValue(gridValue)}</text>
            </g>
          )
        })}

        {/* 선 아래 연한 영역 → 선 → 점 */}
        <polygon points={areaPoints} fill="#6C48F5" opacity="0.08" />
        <polyline points={linePoints} fill="none" stroke="#6C48F5" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        {points.map(({ x, y }, index) => (
          <circle key={labels[index]} cx={x} cy={y} r={hoveredIndex === index ? 5 : 3.5} fill="white" stroke="#6C48F5" strokeWidth="2.5" />
        ))}

        {/* 마우스 감지용 투명 영역 (x축 한 칸씩) */}
        {labels.map((label, index) => (
          <rect key={`hit-${label}`} x={PADDING.left + step * index} y={PADDING.top} width={step} height={chartHeight} fill="transparent" onMouseEnter={() => setHoveredIndex(index)} />
        ))}

        {/* 툴팁 */}
        {hoveredIndex !== null && (() => {
          const tooltipWidth = 120
          const tooltipX = Math.min(Math.max(points[hoveredIndex].x - tooltipWidth / 2, PADDING.left), WIDTH - PADDING.right - tooltipWidth)
          const tooltipY = PADDING.top + 8
          return (
            <g pointerEvents="none">
              <rect x={tooltipX} y={tooltipY} width={tooltipWidth} height={48} rx="10" fill="white" stroke="#E8E6F2" />
              <text x={tooltipX + 12} y={tooltipY + 19} fill="#2A2C41" fontSize="10" fontWeight="700">{labels[hoveredIndex]}</text>
              <text x={tooltipX + 12} y={tooltipY + 36} fill="#6C48F5" fontSize="11" fontWeight="700">{metricLabel} {formatValue(values[hoveredIndex])}</text>
            </g>
          )
        })()}

        {/* x축 라벨 */}
        {labels.map((label, index) =>
          // 마지막 날짜(가장 최근)는 항상 보이도록 끝에서부터 센다
          (labels.length - 1 - index) % labelStep === 0 && (
            <text key={label} x={PADDING.left + step * index + step / 2} y={HEIGHT - 14} textAnchor="middle" fill="#9A97A7" fontSize="11">{label}</text>
          ),
        )}
      </svg>
    </div>
  )
}

export default MetricTrendChart
