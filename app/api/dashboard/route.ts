import { NextResponse } from 'next/server';
import { connectDb } from '@/lib/db';
import { Reservation } from '@/models/Reservation';
import { Vehicle } from '@/models/Vehicle';
import { Payment } from '@/models/Payment';
import { Expense } from '@/models/Expense';
import { startOfDay, endOfDay, startOfMonth, endOfMonth } from 'date-fns';
import { getCurrentUser, requireRole } from '@/lib/auth';

export async function GET() {
  try {
    const user = await getCurrentUser();
    requireRole(user, ['admin', 'agent']);
    await connectDb();

    const todayStart = startOfDay(new Date());
    const todayEnd = endOfDay(new Date());
    const monthStart = startOfMonth(new Date());
    const monthEnd = endOfMonth(new Date());

    // 1. Stats vehicules
    const totalVehicles = await Vehicle.countDocuments();
    const vehiculesLoues = await Vehicle.countDocuments({ statut: 'loue' });
    const vehiculesDisponibles = await Vehicle.countDocuments({ statut: 'disponible' });
    const vehiculesEnMaintenance = await Vehicle.countDocuments({ statut: 'maintenance' });

    // 2. Stats reservations
    const reservationsEnCours = await Reservation.countDocuments({ statut: 'en_cours' });
    const reservationsEnAttente = await Reservation.countDocuments({ statut: 'en_attente' });
    const reservationsConfirmees = await Reservation.countDocuments({ statut: 'confirmee' });
    const reservationsTermineesAujourdhui = await Reservation.countDocuments({
      statut: 'terminee',
      finAt: { $gte: todayStart, $lte: todayEnd }
    });

    // 3. Stats paiements reservations
    const reservationsPayees = await Reservation.countDocuments({ paiementStatut: 'paye' });
    const reservationsPartielles = await Reservation.countDocuments({ paiementStatut: 'partiel' });
    const reservationsNonPayees = await Reservation.countDocuments({ paiementStatut: 'plus_tard' });
    const vehiculesReserves = await Vehicle.countDocuments({ statut: 'reserve' });

    // 4. Revenus du jour et mois
    const paymentsToday = await Payment.find({ createdAt: { $gte: todayStart, $lte: todayEnd } });
    const revenueToday = paymentsToday.reduce((acc, p) => acc + (p.montant || 0), 0);
    
    const paymentsMonth = await Payment.find({ createdAt: { $gte: monthStart, $lte: monthEnd } });
    const revenueMonth = paymentsMonth.reduce((acc, p) => acc + (p.montant || 0), 0);

    // 5. Depenses du mois
    const expensesMonth = await Expense.find({ createdAt: { $gte: monthStart, $lte: monthEnd } });
    const depensesMois = expensesMonth.reduce((acc, e) => acc + (e.montant || 0), 0);

    // 6. Taux d'occupation
    const occupancyRate = totalVehicles > 0 ? Math.round((vehiculesLoues / totalVehicles) * 100) : 0;

    // 7. Reservations en retard (finAt < now et statut en_cours)
    const lateReservationsCount = await Reservation.countDocuments({
      statut: 'en_cours',
      finAt: { $lt: new Date() }
    });

    // 8. Alertes maintenance
    // Vidange proche (ex: à moins de 500km ou dépassé) ou Assurance expire dans 7 jours
    const vehicles = await Vehicle.find({}).select('marque modele kilometrage alerts');
    const maintenanceAlerts = vehicles.reduce((acc: any[], v) => {
      const alerts = [];
      
      // Vidange
      if (v.alerts?.vidangeAtKm && v.kilometrage >= v.alerts.vidangeAtKm - 500) {
        const diff = v.alerts.vidangeAtKm - v.kilometrage;
        alerts.push({
          type: 'vidange',
          message: `Vidange ${diff < 0 ? 'en retard de ' + Math.abs(diff) : 'dans ' + diff} km`,
          severity: diff < 0 ? 'danger' : 'warning'
        });
      }

      // Assurance
      if (v.alerts?.assuranceExpireLe) {
        const expiry = new Date(v.alerts.assuranceExpireLe);
        const daysLeft = Math.ceil((expiry.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
        if (daysLeft <= 7) {
          alerts.push({
            type: 'assurance',
            message: `Assurance expire dans ${daysLeft} jours`,
            severity: daysLeft < 0 ? 'danger' : 'warning'
          });
        }
      }

      if (alerts.length > 0) {
        acc.push({
          vehicle: `${v.marque} ${v.modele}`,
          alerts
        });
      }
      return acc;
    }, []);

    // 9. Reservations en attente (demandes a traiter)
    const pendingReservations = await Reservation.find({ statut: 'en_attente' })
      .populate('vehicle', 'modele immatriculation')
      .populate('client', 'nom prenom telephone')
      .sort({ createdAt: -1 })
      .limit(10)
      .lean<any[]>();

    const pendingList = pendingReservations.map((r) => ({
      id: r._id.toString(),
      vehicle: r.vehicle?.modele ?? 'N/A',
      vehicleImmat: r.vehicle?.immatriculation ?? '',
      client: r.client ? `${r.client.prenom ?? ''} ${r.client.nom}`.trim() : null,
      clientInline: r.clientInline ? `${r.clientInline.prenom} ${r.clientInline.nom} (${r.clientInline.telephone})` : null,
      debutAt: r.debutAt,
      finAt: r.finAt,
      prix: r.prix?.totalEstime ?? 0,
      canal: r.canal ?? 'interne',
      createdAt: r.createdAt
    }));

    return NextResponse.json({
      stats: {
        // Vehicules
        totalVehicles,
        vehiculesLoues,
        vehiculesDisponibles,
        vehiculesEnMaintenance,
        vehiculesReserves,
        occupancyRate,
        // Reservations
        reservationsEnCours,
        reservationsEnAttente,
        reservationsConfirmees,
        reservationsTermineesAujourdhui,
        lateReservations: lateReservationsCount,
        // Paiements reservations
        reservationsPayees,
        reservationsPartielles,
        reservationsNonPayees,
        // Finances
        revenueToday,
        revenueMonth,
        depensesMois,
        beneficeMois: revenueMonth - depensesMois
      },
      maintenanceAlerts: maintenanceAlerts.slice(0, 5),
      pendingReservations: pendingList
    });

  } catch (error) {
    console.error('Dashboard API Error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
