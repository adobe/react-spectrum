import {ActionButton, DialogTrigger, NotificationBadge, Popover} from '@react-spectrum/s2';
import Bell from '@react-spectrum/s2/icons/Bell';
import {Comment} from '../Typography';
import {style} from '@react-spectrum/s2/style' with {type: 'macro'};
import { PopoverContextProvider } from './AccountMenu';
import { useLocale } from 'react-aria';

const COMMENTS = [
  {
    author: 'Nikolas Gibbons',
    avatar: 'https://www.untitledui.com/images/avatars/nikolas-gibbons',
    date: '2 hours ago',
    body: 'Thanks for the feedback!'
  },
  {
    author: 'Adriana Sullivan',
    avatar: 'https://www.untitledui.com/images/avatars/adriana-sullivan',
    date: 'July 14',
    body: 'Transitions are smooth! Could we speed them up just a bit?'
  },
  {
    author: 'Frank Whitaker',
    avatar: 'https://www.untitledui.com/images/avatars/frank-whitaker?',
    date: 'July 13',
    body: 'Love the direction. Could we simplify the header a bit more?'
  }
];

const ARABIC_COMMENTS = [
  {
    author: 'يوسف العتيبي',
    avatar: 'https://www.untitledui.com/images/avatars/nikolas-gibbons',
    date: 'منذ ساعتين',
    body: 'شكرا على تعليقاتك!'
  },
  {
    author: 'ليلى السالم',
    avatar: 'https://www.untitledui.com/images/avatars/adriana-sullivan',
    date: '14 يوليو',
    body: 'الانتقالات سلسة! هل يمكننا تسريعها قليلاً؟'
  },
  {
    author: 'خالد بن رشيد',
    avatar: 'https://www.untitledui.com/images/avatars/frank-whitaker?',
    date: '13 يوليو',
    body: 'أعجبني الاتجاه. هل يُمكننا تبسيط العنوان أكثر؟'
  }
];

export function Notifications() {
  let {locale} = useLocale();
  let comments = locale === 'ar-AE' ? ARABIC_COMMENTS : COMMENTS;
  return (
    <DialogTrigger>
      <ActionButton isQuiet aria-label="3 notifications">
        <Bell />
        <NotificationBadge value={3} />
      </ActionButton>
      <PopoverContextProvider>
        <Popover styles={style({maxWidth: 300})}>
          <div
            className={style({
              display: 'flex',
              flexDirection: 'column',
              rowGap: 20,
              overflow: 'auto',
              flexGrow: 1,
              minHeight: 0
            })}>
            <h3 className={style({font: 'title-lg', color: {default: 'title', forcedColors: 'ButtonText'}, marginY: 0})}>
              {locale === 'ar-AE' ? 'إشعارات' : 'Notifications'}
            </h3>
            {comments.map((comment, i) => (
              <Comment key={i} {...comment} />
            ))}
          </div>
        </Popover>
      </PopoverContextProvider>
    </DialogTrigger>
  );
}
