import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  TooltipContentProps,
  TooltipIndex,
  useRechartsTheme,
} from 'recharts';



const CustomTooltip = ({ active, payload, label }: TooltipContentProps) => {
  const theme = useRechartsTheme();
  const firstPayload = payload?.[0];
  const isVisible = active && firstPayload != null;
  return (
    <div
      className="custom-tooltip"
      style={{
        ...theme?.typography,
        ...theme?.tooltip?.contentStyle,
        visibility: isVisible ? 'visible' : 'hidden',
      }}
    >
      {isVisible && (
        <div className='bg-white p-4 border'>
          <p className="label">{`${label} : $ ${firstPayload.value}`}</p>
          <p className="intro">{}</p>
          <p className="desc">{`${label}'s monthly profits`}</p>
        </div>
      )}
    </div>
  );
};

const CustomContentOfTooltip = ({
  data,
  isAnimationActive,
  defaultIndex,
}: {
  data: { month: string, profits: number}[]
  isAnimationActive?: boolean;
  defaultIndex?: TooltipIndex;
}) => {
  return (
    <BarChart
      style={{ width: '100%', maxWidth: '', maxHeight: '70vh', aspectRatio: 1.618 }}
      responsive
      data={data}
      margin={{
        top: 5,
        right: 0,
        left: 0,
        bottom: 0,
      }}
    >
      <CartesianGrid />
      <XAxis dataKey="month" niceTicks="adaptive" />
      <YAxis width="auto" niceTicks="adaptive" />
      <Tooltip content={CustomTooltip} isAnimationActive={isAnimationActive} defaultIndex={defaultIndex} />
      <Legend />
      <Bar dataKey="profits" barSize={70} fill="#706EE7" isAnimationActive={isAnimationActive} />
    </BarChart>
  );
};

export default CustomContentOfTooltip;
