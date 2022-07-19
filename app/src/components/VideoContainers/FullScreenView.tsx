import React, { useState, useRef, useEffect } from 'react';
import { useWindowSize } from '@react-hook/window-size';
import classnames from 'classnames';
import { useTheme, makeStyles } from '@material-ui/core/styles';
import { useRoomClient } from '../../RoomContext';
import FullScreenExitIcon from '@material-ui/icons/FullscreenExit';
import VideoView from './VideoView';
import ButtonControlBar from '../Controls/ButtonControlBar';
import IconButton from '@material-ui/core/IconButton';
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';
import KeyboardArrowLeftIcon from '@material-ui/icons/KeyboardArrowLeft';
import KeyboardArrowRightIcon from '@material-ui/icons/KeyboardArrowRight';
import KeyboardArrowUpIcon from '@material-ui/icons/KeyboardArrowUp';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import Collapse from '@material-ui/core/Collapse';
import { roomActions } from '../../store/slices/room';
import { useAppDispatch, useAppSelector } from '../../store/selectors';
import type { ConsumerType } from '../../store/slices/consumers';

const useStyles = makeStyles((theme) => ({
  root: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: '100%',
    width: '100%',
    zIndex: 1499,
  },
  controls: {
    position: 'absolute',
    zIndex: 1520,
    right: 0,
    top: 0,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    padding: theme.spacing(1),
    '&.hide': {
      transition: 'opacity 0.1s ease-in-out',
      opacity: 0,
    },
    '&.hover': {
      opacity: 1,
    },
  },
  buttonControlBarPanel: {
    '&.hide': {
      transition: 'opacity 0.1s ease-in-out',
      opacity: 0,
    },
    '&.hover': {
      opacity: 1,
    },
  },
  button: {
    flex: '0 0 auto',
    margin: '0.2vmin',
    borderRadius: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    cursor: 'pointer',
    transitionProperty: 'opacity, background-color',
    transitionDuration: '0.15s',
    width: '5vmin',
    height: '5vmin',
    opacity: 0,
    '&.visible': {
      opacity: 1,
    },
  },
  collapseButton: {
    position: 'fixed',
    display: 'flex',
    zIndex: 30,
    backgroundColor: 'rgba(0,0,0,.1)',
    color: 'white',
    transitionProperty: 'left, bottom',
    transitionDuration: '0.6s',
    [theme.breakpoints.up('md')]: {
      top: '50%',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      transform: 'translate(0%, -50%)',
      left: theme.spacing(1),
    },
    [theme.breakpoints.down('sm')]: {
      flexDirection: 'row',
      bottom: theme.spacing(1),
      left: '50%',
      transform: 'translate(-50%, 0%)',
    },
  },
  expandOpen: {
    [theme.breakpoints.up('md')]: {
      left: theme.spacing(10),
    },
    [theme.breakpoints.down('sm')]: {
      bottom: theme.spacing(10),
    },
  },
  icon: {
    fontSize: '5vmin',
  },
  incompatibleVideo: {
    position: 'absolute',
    zIndex: 1510,
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    '& p': {
      padding: '6px 12px',
      borderRadius: 6,
      userSelect: 'none',
      pointerEvents: 'none',
      fontSize: 15,
      color: 'rgba(255, 255, 255, 0.55)',
    },
  },
}));

export const FullScreenView: React.FC = React.memo(() => {
  const [hover, setHover] = useState(false);

  let touchTimeout = null;

  const roomClient = useRoomClient();
  const classes = useStyles();
  const theme = useTheme();
  const {
    advancedMode,
    consumer,
    toolbarsVisible,
    permanentTopBar,
    fullScreenConsumer,
  } = useAppSelector((state) => ({
    advancedMode: state.settings.advancedMode,
    consumer: state.consumers[state.room.fullScreenConsumer],
    toolbarsVisible: state.room.toolbarsVisible,
    permanentTopBar: state.settings.permanentTopBar,
    fullScreenConsumer: state.room.fullScreenConsumer,
  }));
  const dispatch = useAppDispatch();

  const toggleConsumerFullscreen = (consumer: ConsumerType) => {
    if (consumer) {
      dispatch(roomActions.toggleConsumerFullscreen(consumer.id));
    }
  };

  const smallScreen = useMediaQuery(theme.breakpoints.down('sm'));

  const [expanded, setExpanded] = React.useState(false);

  let timer = null;

  const handleExpandClick = () => {
    setExpanded(!expanded);
  };

  const handleAutoHide = (logical) => {
    logical
      ? (timer = setTimeout(() => setExpanded(false), 10000))
      : clearTimeout(timer);
  };

  const elementRef = useRef(null);
  const size = useWindowSize({
    wait: 400,
  });

  useEffect(() => {
    if (!elementRef.current) {
      return;
    }

    if (consumer && consumer.type !== 'simple') {
      roomClient.adaptConsumerPreferredLayers(consumer, size[0], size[1]);
    }
  }, [size, fullScreenConsumer, consumer, roomClient]);

  if (!consumer) {
    return null;
  }

  const consumerVisible =
    Boolean(consumer) && !consumer.locallyPaused && !consumer.remotelyPaused;

  return (
    <div
      className={classes.root}
      ref={elementRef}
      onMouseOver={() => setHover(true)}
      onMouseOut={() => setHover(false)}
      onTouchStart={() => {
        if (touchTimeout) {
          clearTimeout(touchTimeout);
        }

        setHover(true);
      }}
      onTouchEnd={() => {
        if (touchTimeout) {
          clearTimeout(touchTimeout);
        }

        touchTimeout = setTimeout(() => {
          setHover(false);
        }, 2000);
      }}
    >
      <div
        className={classnames(classes.controls, 'hide', hover ? 'hover' : null)}
      >
        <div
          className={classnames(classes.button, {
            visible: toolbarsVisible || permanentTopBar,
          })}
          onClick={(e) => {
            e.stopPropagation();
            toggleConsumerFullscreen(consumer);
          }}
        >
          <FullScreenExitIcon className={classes.icon} />
        </div>
      </div>
      <div
        className={classnames(
          classes.buttonControlBarPanel,
          'hide',
          hover ? 'hover' : null
        )}
        onMouseEnter={() => handleAutoHide(false)}
        onMouseLeave={() => handleAutoHide(true)}
      >
        <IconButton
          className={classnames(classes.collapseButton, {
            [classes.expandOpen]: expanded,
          })}
          onClick={handleExpandClick}
        >
          {smallScreen ? (
            expanded ? (
              <KeyboardArrowDownIcon />
            ) : (
              <KeyboardArrowUpIcon />
            )
          ) : expanded ? (
            <KeyboardArrowLeftIcon />
          ) : (
            <KeyboardArrowRightIcon />
          )}
        </IconButton>

        <Collapse in={expanded} timeout="auto" unmountOnExit>
          <ButtonControlBar />
        </Collapse>
      </div>

      <VideoView
        advancedMode={advancedMode}
        videoContain={true}
        consumerSpatialLayers={consumer ? consumer.spatialLayers : null}
        consumerTemporalLayers={consumer ? consumer.temporalLayers : null}
        consumerCurrentSpatialLayer={
          consumer ? consumer.currentSpatialLayer : null
        }
        consumerCurrentTemporalLayer={
          consumer ? consumer.currentTemporalLayer : null
        }
        consumerPreferredSpatialLayer={
          consumer ? consumer.preferredSpatialLayer : null
        }
        consumerPreferredTemporalLayer={
          consumer ? consumer.preferredTemporalLayer : null
        }
        videoMultiLayer={consumer && consumer.type !== 'simple'}
        videoTrack={consumer && consumer.track}
        videoVisible={consumerVisible}
        videoCodec={consumer && consumer.codec}
        videoScore={consumer ? consumer.score : null}
        width={size[0]}
        height={size[1]}
      />
    </div>
  );
});
FullScreenView.displayName = 'FullScreenView';
