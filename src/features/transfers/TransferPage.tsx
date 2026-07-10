import React from 'react';
import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HiAcademicCap,
  HiArrowTrendingUp,
  HiTruck,
  HiExclamationTriangle,
  HiArrowLeft,
  HiBanknotes,
  HiCheck,
  HiXMark,
  HiBuildingOffice,
  HiCalendar,
  HiGlobeAlt,
  HiStar,
  HiShieldExclamation,
} from 'react-icons/hi2';
import { useGameStore } from '../../stores/gameStore';
import { usePhaseNavigation } from '../../utils/phaseNavigation';
import { useSimulationStore } from '../../stores/simulationStore';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import PageTransition from '../../components/layout/PageTransition';
import type { TransferOffer } from '../../types';

type Tab = 'incoming' | 'myClub' | 'market';

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  notation: 'compact',
  maximumFractionDigits: 1,
});

const fullCurrencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

const TABS: { key: Tab; label: string; icon: React.JSX.Element }[] = [
  { key: 'incoming', label: 'Incoming Offers', icon: <HiTruck className="w-4 h-4" /> },
  { key: 'myClub', label: 'My Club', icon: <HiBuildingOffice className="w-4 h-4" /> },
  { key: 'market', label: 'Transfer Market', icon: <HiGlobeAlt className="w-4 h-4" /> },
];

function OfferCard({
  offer,
  onAccept,
  onReject,
}: {
  offer: TransferOffer;
  onAccept: () => void;
  onReject: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      layout
      className="p-4 bg-gray-900 rounded-xl border border-gray-800 space-y-3"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-indigo-500/15 flex items-center justify-center">
            <HiBuildingOffice className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <p className="text-sm font-bold text-white">{offer.fromClub}</p>
            <Badge variant={offer.type === 'Transfer' ? 'info' : 'warning'} className="mt-1">
              {offer.type}
            </Badge>
          </div>
        </div>
        <span className="text-xs text-gray-500">Week {offer.week}</span>
      </div>
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div>
          <p className="text-xs text-gray-500 uppercase">Transfer Fee</p>
          <p className="text-white font-semibold">{fullCurrencyFormatter.format(offer.fee)}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 uppercase">Weekly Salary</p>
          <p className="text-white font-semibold">{currencyFormatter.format(offer.weeklySalary)}/wk</p>
        </div>
      </div>
      <div className="flex gap-2 pt-1">
        <Button
          variant="primary"
          size="sm"
          className="flex-1"
          icon={<HiCheck className="w-4 h-4" />}
          onClick={onAccept}
        >
          Accept
        </Button>
        <Button
          variant="secondary"
          size="sm"
          className="flex-1"
          icon={<HiXMark className="w-4 h-4" />}
          onClick={onReject}
        >
          Reject
        </Button>
      </div>
    </motion.div>
  );
}

export default function TransferPage() {
  const player = useGameStore((s) => s.player);
  const currentClub = useGameStore((s) => s.currentClub);
  const transferWindow = useGameStore((s) => s.transferWindow);
  const seasonWeek = useGameStore((s) => s.seasonWeek);
  const currentSeason = useGameStore((s) => s.currentSeason);
  const { goTo } = usePhaseNavigation();

  const transfers = useSimulationStore((s) => s.transfers);
  const acceptTransfer = useSimulationStore((s) => s.acceptTransfer);
  const rejectTransfer = useSimulationStore((s) => s.rejectTransfer);

  const pendingOffers = useGameStore((s) => s.pendingOffers);
  const acceptClubOffer = useGameStore((s) => s.acceptClubOffer);
  const dismissClubOffer = useGameStore((s) => s.dismissClubOffer);

  const [activeTab, setActiveTab] = useState<Tab>('incoming');
  const [selectedClub, setSelectedClub] = useState<string | null>(null);

  if (!player || !currentClub) return null;

  const isDeadlineDay =
    (transferWindow === 'Summer' && seasonWeek === 16) ||
    (transferWindow === 'Winter' && seasonWeek === 20);

  const incomingOffers = transfers.filter(
    (t) => t.playerId === player.id && t.status === 'Pending'
  );

  const interestedClubs = useMemo(() => {
    const seen = new Set<string>();
    return transfers
      .filter((t) => t.playerId === player.id && t.status !== 'Rejected')
      .filter((t) => {
        const key = t.fromClub;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
  }, [transfers, player.id]);

  const handleAccept = (offerId: string) => {
    acceptTransfer(offerId);
  };

  const handleReject = (offerId: string) => {
    rejectTransfer(offerId);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'incoming':
        return (
          <div className="space-y-4">
            {isDeadlineDay && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-4 bg-rose-500/15 border-2 border-rose-500/40 rounded-xl"
              >
                <div className="flex items-center gap-3">
                  <HiExclamationTriangle className="w-6 h-6 text-rose-400 shrink-0" />
                  <div>
                    <p className="text-sm font-bold text-rose-400">Transfer Deadline Day!</p>
                    <p className="text-xs text-rose-400/70">
                      Offers expiring soon - make your decision now!
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {transferWindow === 'None' && (
              <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl">
                <div className="flex items-center gap-3">
                  <HiCalendar className="w-5 h-5 text-amber-400 shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-amber-400">Transfer Window Closed</p>
                    <p className="text-xs text-amber-400/70">
                      Next window opens in the summer or winter period.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {transferWindow !== 'None' && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
                <div className="flex items-center gap-2">
                  <HiGlobeAlt className="w-4 h-4 text-emerald-400" />
                  <span className="text-sm text-emerald-400 font-semibold">
                    {transferWindow} Transfer Window - Open
                  </span>
                </div>
              </div>
            )}

            <div className="flex items-center gap-2 text-sm text-gray-400">
              <HiAcademicCap className="w-4 h-4 text-indigo-400" />
              <p>
                Your agent has received <span className="text-white font-semibold">{incomingOffers.length}</span> offer{incomingOffers.length !== 1 ? 's' : ''} for you.
                Review and decide on each proposal.
              </p>
            </div>

            {pendingOffers.length > 0 && (
              <div className="space-y-3">
                <p className="text-xs uppercase tracking-wider text-emerald-400 font-semibold">
                  Club Career Offers
                </p>
                {pendingOffers.map((offer) => (
                  <motion.div
                    key={offer.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-gray-900 rounded-xl border border-emerald-500/30 space-y-3"
                  >
                    <div className="flex items-center gap-3">
                      {offer.club.crest ? (
                        <img src={offer.club.crest} alt={offer.club.name} className="w-10 h-10 object-contain" />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-emerald-500/15 flex items-center justify-center">
                          <HiBuildingOffice className="w-5 h-5 text-emerald-400" />
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-bold text-white">{offer.club.name}</p>
                        <p className="text-xs text-gray-500">{offer.leagueName} &middot; Rep {offer.reputation}</p>
                      </div>
                    </div>
                    <div className="flex gap-2 pt-1">
                      <Button
                        variant="primary"
                        size="sm"
                        className="flex-1"
                        icon={<HiCheck className="w-4 h-4" />}
                        onClick={() => acceptClubOffer(offer.id)}
                      >
                        Accept Move
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        className="flex-1"
                        icon={<HiXMark className="w-4 h-4" />}
                        onClick={() => dismissClubOffer(offer.id)}
                      >
                        Dismiss
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}


            {incomingOffers.length === 0 ? (
              <div className="text-center py-12">
                <HiTruck className="w-12 h-12 text-gray-700 mx-auto mb-3" />
                <p className="text-gray-500">No incoming offers at this time.</p>
                <p className="text-xs text-gray-600 mt-1">Perform well in matches to attract interest.</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {incomingOffers.map((offer) => (
                  <OfferCard
                    key={offer.id}
                    offer={offer}
                    onAccept={() => handleAccept(offer.id)}
                    onReject={() => handleReject(offer.id)}
                  />
                ))}
              </div>
            )}
          </div>
        );

      case 'myClub':
        return (
          <div className="space-y-4">
            <Card
              header={
                <div className="flex items-center gap-3">
                  <HiBuildingOffice className="w-5 h-5 text-indigo-400" />
                  <span className="text-lg font-bold text-white">{currentClub.name}</span>
                  <Badge variant="info">{currentClub.league}</Badge>
                </div>
              }
            >
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-gray-900 rounded-lg border border-gray-800">
                    <p className="text-xs text-gray-500 uppercase">League Position</p>
                    <p className="text-xl font-bold text-white mt-1">{currentClub.leaguePosition}</p>
                  </div>
                  <div className="p-3 bg-gray-900 rounded-lg border border-gray-800">
                    <p className="text-xs text-gray-500 uppercase">Reputation</p>
                    <div className="flex items-center gap-1 mt-1">
                      {Array.from({ length: 5 }, (_, i) => (
                        <HiStar
                          key={i}
                          className={`w-4 h-4 ${
                            i < Math.round(currentClub.reputation / 20)
                              ? 'text-amber-400'
                              : 'text-gray-700'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-800 pt-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-400">Contract Years Remaining</span>
                    <span className="text-sm font-bold text-white">
                      {player.contractYears} {player.contractYears === 1 ? 'year' : 'years'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-400">Release Clause</span>
                    <span className="text-sm font-bold text-white">
                      {fullCurrencyFormatter.format(player.releaseClause)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-400">Weekly Salary</span>
                    <span className="text-sm font-bold text-emerald-400">
                      {currencyFormatter.format(player.weeklySalary)}/wk
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-400">Market Value</span>
                    <span className="text-sm font-bold text-sky-400">
                      {fullCurrencyFormatter.format(player.marketValue)}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <Button
                    variant="secondary"
                    size="md"
                    icon={<HiArrowTrendingUp className="w-4 h-4" />}
                    className="w-full"
                    onClick={() => {}}
                  >
                    Request Transfer
                  </Button>
                  <Button
                    variant="primary"
                    size="md"
                    icon={<HiBanknotes className="w-4 h-4" />}
                    className="w-full"
                    onClick={() => {}}
                  >
                    Renegotiate Contract
                  </Button>
                </div>
              </div>
            </Card>

            <Card header={<span className="text-lg font-bold text-white">Club Overview</span>}>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">Stadium</span>
                  <span className="text-sm text-white font-semibold">{currentClub.stadium}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">Budget</span>
                  <span className="text-sm text-emerald-400 font-semibold">
                    {fullCurrencyFormatter.format(currentClub.budget)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">Squad Rating</span>
                  <span className="text-sm text-white font-semibold">{currentClub.rating}</span>
                </div>
                <div className="flex justify-between items-start">
                  <span className="text-sm text-gray-400">Objectives</span>
                  <div className="text-right">
                    {currentClub.objectives.map((obj, i) => (
                      <p key={i} className="text-xs text-white">{obj}</p>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          </div>
        );

      case 'market':
        return (
          <div className="space-y-4">
            <Card header={<span className="text-lg font-bold text-white">Clubs Showing Interest</span>}>
              {interestedClubs.length === 0 ? (
                <div className="text-center py-8">
                  <HiGlobeAlt className="w-12 h-12 text-gray-700 mx-auto mb-3" />
                  <p className="text-gray-500">No clubs are currently interested.</p>
                  <p className="text-xs text-gray-600 mt-1">Improve your form to attract attention.</p>
                </div>
              ) : (
                <div className="grid gap-3">
                  {interestedClubs.map((offer) => (
                    <motion.button
                      key={offer.id}
                      whileHover={{ x: 4 }}
                      onClick={() =>
                        setSelectedClub(
                          selectedClub === offer.fromClub ? null : offer.fromClub
                        )
                      }
                      className={`w-full text-left p-4 rounded-xl border transition-all ${
                        selectedClub === offer.fromClub
                          ? 'border-indigo-500 bg-indigo-500/10'
                          : 'border-gray-800 bg-gray-900 hover:border-gray-600'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-gray-800 flex items-center justify-center">
                            <HiBuildingOffice className="w-5 h-5 text-gray-300" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-white">{offer.fromClub}</p>
                            <p className="text-xs text-gray-500">
                              {offer.type === 'Transfer' ? 'Transfer offer' : 'Loan offer'}
                            </p>
                          </div>
                        </div>
                        <Badge variant={offer.status === 'Pending' ? 'warning' : 'success'}>
                          {offer.status}
                        </Badge>
                      </div>
                      {selectedClub === offer.fromClub && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          className="mt-3 pt-3 border-t border-gray-800 space-y-2"
                        >
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-400">Fee Offered</span>
                            <span className="text-white font-semibold">
                              {fullCurrencyFormatter.format(offer.fee)}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-400">Salary Offered</span>
                            <span className="text-white font-semibold">
                              {currencyFormatter.format(offer.weeklySalary)}/wk
                            </span>
                          </div>
                          <div className="flex gap-2 mt-2">
                            <Button
                              variant="primary"
                              size="sm"
                              className="flex-1"
                              icon={<HiCheck className="w-4 h-4" />}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleAccept(offer.id);
                              }}
                            >
                              Accept
                            </Button>
                            <Button
                              variant="secondary"
                              size="sm"
                              className="flex-1"
                              icon={<HiXMark className="w-4 h-4" />}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleReject(offer.id);
                              }}
                            >
                              Decline
                            </Button>
                          </div>
                        </motion.div>
                      )}
                    </motion.button>
                  ))}
                </div>
              )}
            </Card>
          </div>
        );
    }
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-gray-950 text-white pb-8">
        <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => goTo('home')}
                className="p-2 rounded-lg bg-gray-900 border border-gray-800 text-gray-400 hover:text-white hover:border-gray-600 transition-colors"
              >
                <HiArrowLeft className="w-5 h-5" />
              </motion.button>
              <div>
                <h1 className="text-2xl font-black bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                  Transfer Hub
                </h1>
                <p className="text-sm text-gray-500">
                  Season {currentSeason} &middot; {transferWindow === 'None' ? 'No Window' : `${transferWindow} Window`}
                </p>
              </div>
            </div>
            <Badge
              variant={transferWindow !== 'None' ? 'success' : 'default'}
              icon={<HiGlobeAlt className="w-3.5 h-3.5" />}
            >
              {transferWindow !== 'None' ? 'Window Open' : 'Window Closed'}
            </Badge>
          </motion.div>

          <div className="flex gap-2 border-b border-gray-800 pb-2">
            {TABS.map((tab) => (
              <motion.button
                key={tab.key}
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                  activeTab === tab.key
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`}
              >
                {tab.icon}
                {tab.label}
              </motion.button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {renderTabContent()}
            </motion.div>
          </AnimatePresence>

          {isDeadlineDay && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg text-center"
            >
              <p className="text-sm font-bold text-rose-400">
                <HiShieldExclamation className="w-4 h-4 inline mr-1" />
                Transfer Deadline Day - All offers expire at midnight!
              </p>
            </motion.div>
          )}

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => goTo('home')}
            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
          >
            <HiArrowLeft className="w-4 h-4" />
            Back to Home
          </motion.button>
        </div>
      </div>
    </PageTransition>
  );
}
